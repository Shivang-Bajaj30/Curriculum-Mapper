from flask import Flask, request, jsonify
from flask_cors import CORS 

app = Flask(__name__)
CORS(app)

@app.route("/")
def index():
    return "<p>Hello, World!</p>"

@app.route("/api/search", methods=["POST"])
def search():
    data = request.get_json(silent=True) or {}
    query = (data.get("query") or "").strip()
    if not query:
        return jsonify({"error": "query is required"}), 400
    return jsonify({"query": query, "results": []})

@app.route("/api/upload", methods=["POST"])
def upload():
    files = request.files.getlist("files") or request.files.getlist("file")
    names = [f.filename for f in files if f.filename]
    if not names:
        return jsonify({"error": "no files provided"}), 400
    return jsonify({"uploaded": names})

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "Backend is running"})
