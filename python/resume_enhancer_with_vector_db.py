import json
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
from keybert import KeyBERT
import ollama
from groq import Groq
from flask import Flask, request, render_template, jsonify
import os
import re

# Configuration
LLM_SERVICE = 'groq'  
if LLM_SERVICE == 'groq':
    MODEL_NAME = 'llama-3.3-70b-versatile'
    GROQ_API_KEY = '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' 
    client = Groq(api_key=GROQ_API_KEY)
elif LLM_SERVICE == 'ollama':
    MODEL_NAME = 'llama3.2'
else:
    raise ValueError("Invalid LLM_SERVICE")

# Load CSV data
print("Loading resumes.csv...")
df = pd.read_csv('resumes.csv')
df = df.dropna()
df['Resume'] = df['Resume'].str.lower()
print(f"CSV loaded: {df.shape}")

# Initialize Sentence Transformer for embeddings
print("Initializing SentenceTransformer model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model initialized")

# Check if embeddings need to be recreated
csv_file = 'resumes.csv'
embeddings_file = 'resume_embeddings.npy'
if not os.path.exists(embeddings_file) or os.path.getmtime(csv_file) > os.path.getmtime(embeddings_file):
    print("Generating new embeddings...")
    resume_embeddings = model.encode(df['Resume'].tolist())
    np.save(embeddings_file, resume_embeddings)
    print(f"Embeddings generated and saved: {resume_embeddings.shape}")
else:
    print("Loading existing embeddings...")
    resume_embeddings = np.load(embeddings_file)
    print(f"Embeddings loaded: {resume_embeddings.shape}")

# Create FAISS index for vector database
print("Creating FAISS index...")
faiss_index = faiss.IndexFlatL2(resume_embeddings.shape[1])
faiss_index.add(resume_embeddings)
print("FAISS index created")

# Initialize KeyBERT for keyword extraction
print("Initializing KeyBERT...")
kw_model = KeyBERT()
print("KeyBERT initialized")

def extract_keywords(text):
    print("Extracting keywords...")
    keywords = kw_model.extract_keywords(text, keyphrase_ngram_range=(1, 2), stop_words='english')
    print(f"Keywords extracted: {keywords}")
    return [kw[0] for kw in keywords]

def get_similar_resumes(job_description, k=3):
    print("Retrieving similar resumes...")
    jd_embedding = model.encode([job_description])
    D, I = faiss_index.search(jd_embedding, k)
    similar_resumes = df.iloc[I[0]]['Resume'].tolist()
    print(f"Retrieved {len(similar_resumes)} similar resumes")
    return similar_resumes

def extract_additional_keywords(similar_resumes):
    print("Extracting additional keywords from similar resumes...")
    additional_keywords = []
    for resume in similar_resumes:
        keywords = extract_keywords(resume)
        additional_keywords.extend(keywords)
    print(f"Additional keywords: {list(set(additional_keywords))}")
    return list(set(additional_keywords))

def generate_text(prompt):
    print("Generating text with LLM...")
    messages = [
        {
            "role": "system",
            "content": "You are an expert resume writer specializing in ATS-optimized content. You enhance resumes to align with job descriptions, using concise language,quantification, strong action verbs, and relevant keywords."
        },
        {
            "role": "user",
            "content": prompt
        }
    ]
    try:
        if LLM_SERVICE == 'groq':
            completion = client.chat.completions.create(
                model=MODEL_NAME,
                messages=messages,
                temperature=1,
                max_tokens=2048,
                top_p=1,
            )
            return completion.choices[0].message.content
        elif LLM_SERVICE == 'ollama':
            response = ollama.chat(
                model=MODEL_NAME,
                messages=messages,
                options={'temperature': 1, 'num_predict': 2048, 'top_p': 1}
            )
            return response['message']['content']
        else:
            raise ValueError("Invalid LLM_SERVICE")
    except Exception as e:
        print(f"Error in LLM call: {e}")
        return "Error generating text"

def enhance_resume(user_json, job_description):
    print("Enhancing resume...")
    jd_keywords = extract_keywords(job_description)
    similar_resumes = get_similar_resumes(job_description)
    additional_keywords = extract_additional_keywords(similar_resumes)
    all_keywords = list(set(jd_keywords + additional_keywords))
    keywords_str = ', '.join(all_keywords)
    
    resume_json_str = json.dumps(user_json, indent=2)
    
    prompt = f"""
You are an expert resume writer specializing in ATS-optimized content. Your task is to enhance the provided resume JSON to align with the given job description, ensuring it is optimized for Applicant Tracking Systems (ATS).

Original resume JSON:
{resume_json_str}

Job description:
{job_description}

Relevant keywords:
{keywords_str}

Enhance the resume as follows:
1. Add a professional summary if missing, or improve the existing one, highlighting skills and experience from the job description (80-110 words).
2. Enhance descriptions in sections like 'experience_and_trainings' and 'projects' to include keywords and strong action verbs (e.g., 'developed', 'optimized'). also add quantification ,Keep each description concise, 80-100 words, in 2-3 bullet points.
3. For the 'skills' section (a dictionary with categories like 'programming_languages'), reorder lists within each category to prioritize skills mentioned in the job description.
4. Retain all sections unless clearly irrelevant (e.g., exclude 'SEO-Digiskills' certification if unrelated). Enhance relevant sections to align with job requirements.
5. Use only the information in the resume and job description. Do not add fictional details or experiences.
6. Follow ATS best practices: use standard headings (e.g., 'Summary', 'Experience'), concise language, and natural keyword inclusion.

Output only the enhanced resume in JSON format, maintaining the input structure. The response must be a JSON object, starting with '{{' and ending with '}}', with no additional text.
"""
    
    response = generate_text(prompt)
    
    try:
        # Extract JSON object if extra text is present
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            enhanced_json = json.loads(json_str)
            return enhanced_json
        enhanced_json = json.loads(response)
        return enhanced_json
    except json.JSONDecodeError:
        print("Error parsing LLM output as JSON")
        return {"error": "Failed to generate enhanced resume"}

# Flask application
app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    print("Handling request...")
    if request.method == 'POST':
        user_json_str = request.form['user_json']
        job_description = request.form['job_description']
        try:
            user_json = json.loads(user_json_str)
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid JSON format"})
        enhanced_json = enhance_resume(user_json, job_description)
        print("Returning enhanced JSON")
        return jsonify(enhanced_json)
    print("Rendering index.html")
    return render_template('index.html')

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(debug=True)