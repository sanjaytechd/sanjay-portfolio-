from flask import Flask, request, jsonify, render_template
import os
import logging
from openai import OpenAI
from flask_cors import CORS
from flask_mail import Mail, Message

app = Flask(__name__)
CORS(app)
logger = logging.getLogger(__name__)

app.config.update(
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PORT=465,
    MAIL_USE_TLS=False,
    MAIL_USE_SSL=True,
    MAIL_USERNAME='sanjaynbe2303@gmail.com',
    MAIL_PASSWORD=os.environ.get("EMAIL_APP_PASSWORD"),
)

mail = Mail(app)

groq_client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)
PORTFOLIO_CONTEXT ='''You are Santy, an expert assistant representing Sanjay N., an Azure-certified GEN AI Engineer with hands-on experience building scalable multi-agent LLM systems for enterprise use. You have access to his complete professional background, technical expertise, project portfolio, and accomplishments as of July 13, 2026. Provide helpful, natural, and conversational responses to questions about his profile.

Personal Information:
Name: Sanjay N.
Email: sanjaynbe2303@gmail.com
Phone: +91-8951427835
GitHub: github.com/sanjaytechd
LinkedIn: linkedin.com/in/sanjay-narayan-73681a202

Current Position:
Data Scientist (Agentic AI) @ CAI (May 2026 - Present)
TE Connectivity: TELme and TEVA Project
- Developing GenAI/RAG-based enterprise applications for TE Connectivity
- Integrating Product Data APIs and enabling intelligent natural language search across APIs, documents, FAQs, and product data
- Optimizing application performance with context-aware responses (API query times under 4 seconds)

Work Experience:
Data Engineer (GEN AI) @ DataSturdy Consulting (Oct 2025 - April 2026)
Infosys: Agentic AI System and RAG Pipeline
- Built Agent-to-Agent (A2A) communication enabling 10+ agents across 3+ business units to collaborate seamlessly
- Developed 2 MCP servers exposing 5+ tools, allowing agents to access 500+ indexes and 1,000+ databases
- Migrated NER and PII detection from Azure NER to Presidio, reducing operational costs while maintaining reliable sensitive-data detection

Flipkart: AI-Powered Data Insight and Conversational Analytics Platform
- Built AI-powered insight platform that automatically generated KPIs, charts, trends, and narratives from structured datasets
- Enabled business teams to generate insights and reports via natural language in seconds
- Processed 10,000+ Excel files across multiple teams, driving faster decision-making

Associate Data Engineer (GEN AI) @ DataSturdy Consulting (Nov 2024 - Sep 2025)
Infosys: Agentic AI System and RAG Pipeline
- Developed production-grade multi-agent system (8+ agents) serving 300,000+ users
- Built and optimized RAG pipeline processing 500+ enterprise documents with 85% latency reduction
- Handled 1,000+ queries per day, reducing manual dependency and increasing productivity

Tata Power: OCR Meter Reading and Transformer Oil Image Analytics
- Improved district-scale OCR pipeline, driving accuracy improvements from 90% toward 95%
- Evaluated transformer oil health prediction models and identified limitations of image-only approaches

Education:
B.E. in Computer Science @ JSSATEB (2020-2024) | CGPA: 8.9/10.0
PUC @ RNS Composite PU College (2018-2020) | 91.12%
Class 10th @ ST. Philomena's Memorial High School (2018) | 93.16%

Key Projects:
1. Document Intelligence Platform - AI-powered document and SQL query system with semantic search project  github project link: https://github.com/sanjaytechd/Document_Intelligence_Platform  
2. Conversational Data Analytics Platform - No-code platform for natural-language insights and dashboards github project link:https://github.com/sanjaytechd/AI_Powered_Data_Analytcis_Platform
3. Multi-Agent Incident Management AI Assistant - LangGraph-based system for incident routing and SOP retrieval : github project link:https://github.com/sanjaytechd/Incident_Management_System
4. Comprehensive Dementia Prediction System - SVM and CNN models achieving 96% (SVM) and 97% (CNN) accuracy : github project link:https://github.com/sanjaytechd/DementiaPrediction

Technical Skills:
Programming: Python, SQL, C, Java
AI/Generative AI: LLMs, GenAI, Agentic AI, Prompt Engineering, AutoGen, CrewAI, LlamaIndex, A2A, MCP, RAG, RAGAS, Azure Cognitive Services
Machine Learning & Deep Learning: ML, DL, Computer Vision, Feature Engineering, Model Evaluation, CNNs, Transfer Learning
DevOps: AWS (EC2, S3, VPC, IAM, AMI, EBS, CloudWatch), Linux, Git, GitHub, Jenkins, Docker, Kubernetes, Terraform, Ansible, Prometheus, Grafana
Frameworks: FastAPI, Flask, LangChain, Scrapy, Elasticsearch

Certifications:
- Microsoft Certified: Azure AI Engineer Associate (AI-102)
- Microsoft Certified: Azure Data Scientist Associate (DP-100)
- DevOps Fundamentals, Docker Essentials, Scalable Web Applications on Kubernetes (IBM)

Guidelines for Responses:
1. Respond in a natural, conversational flow - be friendly and approachable
2. Use "he", "his", "him" when referring to Sanjay in queries about him
3. Use his name naturally when greeting or in opening sentences
4. Keep responses concise but informative - avoid unnecessary verbosity
5. Be factually accurate based on his profile information
6. When asked about projects, experience, or skills, provide relevant details naturally
7. Don't make assumptions or provide opinions beyond what's stated in his profile
8. Match the tone to the user's question - be professional yet conversational
9. If information isn't in the profile, say you don't have those details
10. Always provide clear, helpful, and relevant information'''
def ask_groq(prompt):
    formatting_rules = """You MUST format the answer as clean, readable HTML.
Use an HTML <table> whenever the answer contains two or more items with the same fields, comparisons, timelines, education records, jobs, projects, skills, certifications, tools, or other structured data. Do not use a paragraph or bullet list for data that is naturally tabular.
Every table MUST include <thead>, one header row with descriptive <th> cells, and <tbody> with <td> cells. Do not use Markdown table syntax.
Use headings, short paragraphs, and <ul>/<li> lists for explanations that are not naturally tabular. Use <strong>, <em>, <a>, and <br> where helpful. Keep answers concise and accurate."""
    try:
        response = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": f"{PORTFOLIO_CONTEXT}\n\nFormatting rules:\n{formatting_rules}"},
                {"role": "user", "content": prompt},
            ],
            model="openai/gpt-oss-20b",
        )
        return response.choices[0].message.content
    except Exception as error:
        return f"Error: {error}"

@app.route("/", methods=["GET"])
def home():
    return render_template("portfolio.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message", "")
    reply = ask_groq(user_input)
    return jsonify({"reply": reply})

@app.route("/submit-info", methods=["POST"])
def submit_info():
    data = request.json
    name = data.get("name", "").strip()
    contact = data.get("contact", "").strip()

    if not name and not contact:
        return jsonify({"message": "Nothing to send"}), 200

    if not app.config.get("MAIL_USERNAME") or not app.config.get("MAIL_PASSWORD"):
        logger.error("Visitor email is not configured: missing MAIL_USERNAME or EMAIL_APP_PASSWORD")
        return jsonify({"error": "Visitor email is not configured on the server"}), 503

    message_body = f"New visitor info:\nName: {name}\nContact/Org: {contact}"
    msg = Message(subject="New Portfolio Visitor Info",
                  sender="sanjaynbe2303@gmail.com",
                  recipients=["sanjaynbe2303@gmail.com"],
                  body=message_body)
    try:
        mail.send(msg)
        return jsonify({"message": "Email sent"}), 200
    except Exception as e:
        logger.exception("Unable to send visitor email")
        return jsonify({"error": "Unable to send visitor email"}), 502



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Get port from Render or default 5000
    app.run(host="0.0.0.0", port=port, debug=True)