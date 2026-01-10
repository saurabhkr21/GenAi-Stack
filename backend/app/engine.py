from typing import Dict, Any, List
import asyncio
import os
from .nodes.llm import execute_llm_node
from .nodes.rag import execute_rag_node
# from .nodes.search import execute_search_node

async def run_workflow(workflow_data: Dict[str, Any], inputs: Dict[str, Any]) -> Dict[str, Any]:
    nodes = workflow_data.get("nodes", [])
    edges = workflow_data.get("edges", [])

    # Map node ID to node data
    node_map = {node["id"]: node for node in nodes}
    
    # Build adjacency list
    adj = {node["id"]: [] for node in nodes}
    in_degree = {node["id"]: 0 for node in nodes}
    
    for edge in edges:
        source = edge["source"]
        target = edge["target"]
        if source in adj and target in adj:
            adj[source].append(target)
            in_degree[target] += 1

    # Topological sort (BFS)
    queue = [node_id for node_id, deg in in_degree.items() if deg == 0]
    execution_order = []
    
    while queue:
        u = queue.pop(0)
        execution_order.append(u)
        for v in adj[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)
    
    if len(execution_order) != len(nodes):
        raise ValueError("Cycle detected in workflow")

    # Execution State: Stores outputs of each node
    state = {}
    
    # Pre-populate state with inputs if there's an Input Node
    # For simplicity, we assume one Input Node or we map inputs by key.
    
    final_outputs = {}

    for node_id in execution_order:
        node = node_map[node_id]
        node_type = node["type"]
        
        # Get inputs for this node from incoming edges
        node_inputs = {}
        
        # Find edges pointing to this node
        incoming_edges = [e for e in edges if e["target"] == node_id]
        for edge in incoming_edges:
            source_id = edge["source"]
            source_handle = edge["sourceHandle"] # output identifier
            target_handle = edge["targetHandle"] # input identifier
            
            # Retrieve value from state
            if source_id in state:
                # Assuming state[source_id] is a dict of outputs or a single value
                val = state[source_id].get("output", state[source_id])
                node_inputs[target_handle] = val
        
        # Add global inputs if this is an Input Node
        if node_type == "inputNode":
             # For input nodes, we take from the global 'inputs' dict
             # The node might have a 'key' property to know which input to grab
             key = node["data"].get("key", "input")
             node_inputs["value"] = inputs.get(key, "")

        # Execute Node
        print(f"Executing node {node_id} ({node_type})")
        output = await execute_node(node, node_inputs)
        
        state[node_id] = output
        
        if node_type == "outputNode":
             final_outputs[node_id] = output

    return final_outputs

async def execute_node(node: Dict[str, Any], inputs: Dict[str, Any]) -> Any:
    node_type = node["type"]
    data = node["data"]
    
    if node_type == "inputNode":
        return {"output": inputs.get("value", "")}
    
    elif node_type == "llmNode":
        # Combine prompt sources:
        # 1. Static prompt from node settings (data.prompt)
        # 2. Dynamic prompt from 'prompt' handle
        # 3. Context from 'context' handle
        
        static_prompt = data.get("prompt", "")
        input_prompt = inputs.get("prompt", "")
        context = inputs.get("context", "")
        
        # specific RAG case: if context is a dict (from ragNode), stringify it
        if isinstance(context, dict):
            context = str(context.get("output", context))
            
        full_prompt = f"{static_prompt}\n\n{input_prompt}\n\n{context}".strip()
        
        print(f"[DEBUG] Executing LLM Node {node['id']}. Full Prompt: '{full_prompt}'")
        
        # Fallback if empty (to avoid empty API call)
        if not full_prompt:
             return {"output": "Error: Prompt is empty. Please enter a prompt or connect an input."}

        # Get config from node data (model name, etc.)
        model = data.get("model", "gpt-3.5-turbo")
        web_search = data.get("webSearch", False)
        serp_key = data.get("serpKey", os.getenv("SERP_API_KEY")) # Fallback to env var

        return await execute_llm_node(full_prompt, model, web_search=web_search, serp_key=serp_key)
    
    elif node_type == "promptNode":
        template = data.get("template", "")
        # format template with inputs
        # inputs might be {"topic": "AI"}
        # template might be "Tell me a joke about {topic}"
        try:
            formatted = template.format(**inputs)
        except Exception as e:
            formatted = template # Fallback
        return {"output": formatted}
    
    elif node_type == "outputNode":
        return {"output": inputs.get("input", "")} # Pass through

    elif node_type == "ragNode":
        query = inputs.get("query", "")
        file_name = data.get("fileName", "")
        embedding_model = data.get("embeddingModel", "text-embedding-3-large")
        return await execute_rag_node(query, file_name, embedding_model)
        
    return {"output": None}
