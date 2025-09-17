import os
import tempfile
import fitz  
from flask import Flask, request, jsonify, render_template
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

client = Groq(api_key="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")

def extract_text_from_pdf(file_path):
    """Extract text from PDF using PyMuPDF"""
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def analyze_with_groq(document_text, query, doc_type):
    """Send document text and query to Groq API for analysis"""
    system_prompt = f"""You are a specialized {doc_type} document analysis assistant. 
    Analyze the provided document and respond to the user's query with:
    1. Accurate information extraction
    2. Professional interpretation
    3. Clear, structured responses
    4. Relevant citations to document sections
    
    Important: For legal documents, focus on clauses, obligations, and risks.
    For medical documents, focus on conditions, treatments, and observations."""
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Document text:\n{document_text}\n\nUser query: {query}"}
            ],
            model="llama-3.1-8b-instant", 
            temperature=0.3,
            max_tokens=2000
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        return f"Error analyzing document: {str(e)}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze_document():

    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    query = request.form.get('query', '')
    doc_type = request.form.get('doc_type', 'legal')
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    

    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
        file.save(temp_file.name)
        temp_path = temp_file.name
    
    try:

        document_text = extract_text_from_pdf(temp_path)
        

        analysis_result = analyze_with_groq(document_text, query, doc_type)
        
        return jsonify({
            "analysis": analysis_result,
            "doc_type": doc_type,
            "query": query
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    finally:
        os.unlink(temp_path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)