Hello everyone! 

## Project Name - 📚 Curriculum Mapper ##

## 🎯 Aim
The aim of this project is to **bridge the gap between academic curricula and industry job requirements** by using AI and Machine Learning to map student skills to relevant job roles.


## ❓ Problem Statement
In many cases, academic curricula do not align well with current industry demands.  
Students often graduate without a clear understanding of:
- Which job roles their curriculum prepares them for
- What skills are missing for a desired role
- How industry expectations differ from academic learning

This lack of alignment leads to confusion, skill gaps, and reduced job readiness.

---

## 💡 Proposed Solution
The **Curriculum Mapper** analyzes:
- Academic curriculum or user-selected skills  
- Job titles and job descriptions from industry datasets  

Using **semantic similarity (AI/ML)**, the system:
- Matches skills to relevant job roles
- Ranks jobs based on relevance
- Identifies skill gaps
- Helps students understand their career readiness

---

## 🧠 How It Works
1. User provides a list of skills or curriculum content  
2. Job titles and descriptions are preprocessed and cleaned  
3. Text is converted into embeddings using a pretrained NLP model  
4. Cosine similarity is used to compare skills with job data  
5. The system returns the most relevant job roles  

---

## 🛠️ Tech Stack

### Programming Language
- **Python**

### Libraries & Frameworks
- **pandas** – data cleaning and manipulation  
- **sentence-transformers** – semantic text embeddings  
- **scikit-learn** – cosine similarity  
- **Jupyter Notebook** – experimentation and development  

### Tools
- **Git & GitHub** – version control and collaboration  
- **VS Code** – development environment  

---

## 📂 Dataset
- Job data containing:
  - Job Title  
  - Job Description  
  - Skills  
  - Certifications  

Duplicates and inconsistencies are removed during preprocessing.

---

## 🚀 Features
- Skill-to-job mapping
- Semantic (meaning-based) matching instead of keyword matching
- Cleaned and deduplicated job dataset
- Extendable to curriculum-to-job analysis

---

## 📈 Future Enhancements
- Integrate syllabus PDF upload
- Add FastAPI backend
- Build a React-based frontend
- Store results in a database
- Add AI-generated explanations and learning recommendations

---

## 👨‍💻 Contributors
- *Shivang Bajaj*
- *Rewa Bisht*

---

## 📌 Conclusion
Curriculum Mapper is a step toward **data-driven career guidance**, helping students understand how their skills align with real-world job requirements using modern AI techniques.
