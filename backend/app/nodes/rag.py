import os
import fitz # pymupdf
import chromadb
from chromadb.utils import embedding_functions

# Initialize ChromaDB Client
# Using a local persistent path
CHROMA_DB_DIR = "chroma_db"
chroma_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)

def simple_text_splitter(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list[str]:
    """
    Simple recursive-like text splitter.
    """
    if not text:
        return []
    
    chunks = []
    start = 0
    text_len = len(text)
    
    while start < text_len:
        end = start + chunk_size
        if end >= text_len:
            chunks.append(text[start:])
            break
            
        # Try to find a nice break point (newline, space)
        # Look back from 'end' up to 'overlap' distance
        break_point = -1
        for i in range(end, max(start, end - chunk_overlap), -1):
            if text[i] in ["\n", " "]:
                break_point = i
                break
        
        if break_point != -1:
            chunks.append(text[start:break_point])
            start = break_point + 1 # skip citation
        else:
            # Force break
            chunks.append(text[start:end])
            start = end - chunk_overlap
            
    return chunks

async def execute_rag_node(query: str, file_name: str, embedding_model: str = "text-embedding-3-large") -> dict:
    """
    Executes the RAG node logic with real embedding and retrieval.
    """
    
    if not query:
        return {"output": "Error: No query provided_for Knowledge Base."}
    
    if not file_name:
         return {"output": "Warning: No file selected. Queries against general knowledge."}

    file_path = os.path.join("uploads", file_name)
    
    if not os.path.exists(file_path):
        return {"output": f"Error: File '{file_name}' not found. Please upload it first."}

    try:
        # 1. Setup Collection
        # Use filename as collection name (sanitize if needed, but simple for now)
        # Note: Chroma collection names have constraints, keeping it simple
        collection_name = "".join(x for x in file_name if x.isalnum())
        
        # Check if collection exists or create
        # We use OpenAI embeddings
        openai_ef = embedding_functions.OpenAIEmbeddingFunction(
                api_key=os.getenv("OPENAI_API_KEY"),
                model_name=embedding_model
            )
        
        collection = chroma_client.get_or_create_collection(name=collection_name, embedding_function=openai_ef)
        
        # 2. Check if data is already indexed (naive check: count > 0)
        if collection.count() == 0:
            # Ingest and Index
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            
            # Split text
            chunks = simple_text_splitter(text, chunk_size=1000, chunk_overlap=200)
            
            # Add to Chroma
            ids = [f"id{i}" for i in range(len(chunks))]
            collection.add(
                documents=chunks,
                ids=ids
            )
            print(f"Indexed {len(chunks)} chunks for {file_name}")

        # 3. Query
        results = collection.query(
            query_texts=[query],
            n_results=3
        )
        
        # 4. Format Context
        retrieved_docs = results['documents'][0]
        context_text = "\n\n".join(retrieved_docs)
        
        return {"output": context_text}

    except Exception as e:
        print(f"RAG Error: {e}")
        return {"output": f"Error processing Knowledge Base: {str(e)}"}
