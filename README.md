# Neosearch

Music genre graph explorer built in Python with Streamlit, Plotly, and FastAPI.

Maps connections between 16 electronic and underground genres using a spring layout algorithm and pulls 30-second audio previews from the public Deezer API (with a 30-minute in-memory cache so switching between nodes doesn't spam requests).

## Running locally

```bash
git clone https://github.com/hizzui/Neosearch.git
cd Neosearch
pip install -r requirements.txt
streamlit run app.py
```

If you also want to run the FastAPI endpoints (`/api/genres`, `/api/graph`, `/api/genre/{id}/tracks`) separately:

```bash
uvicorn api:app --reload --port 8000
```
