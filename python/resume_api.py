from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import json
import traceback
import uvicorn

from resume_enhancer_with_vector_db import enhance_resume

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResumeEnhanceRequest(BaseModel):
    user_json: Dict[str, Any]
    job_description: str

@app.post("/")
async def enhance_resume_api(request: ResumeEnhanceRequest):
    try:
        enhanced_resume = enhance_resume(request.user_json, request.job_description)
        
        return enhanced_resume
    except Exception as e:
        print(f"Error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("Starting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=5000)