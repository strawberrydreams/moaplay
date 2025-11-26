# app/services/google_calendar.py
import os
import requests
from typing import Optional  # 🔹 추가
from app import db
from app.models.user import User

GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3"

CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

SCOPES = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events"


def build_auth_url():
    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "access_type": "offline",
        "prompt": "consent",
        "scope": SCOPES,
    }

    from urllib.parse import urlencode
    return "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)


def exchange_code_and_save_refresh_token(user: User, code: str) -> None:
    data = {
        "code": code,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    res = requests.post(GOOGLE_TOKEN_URL, data=data)
    res.raise_for_status()
    token_json = res.json()

    refresh_token = token_json.get("refresh_token")
    if not refresh_token:
        # 이미 한번 동의한 계정이면 refresh_token 안줄 수 있음
        raise RuntimeError("No refresh_token returned from Google")

    user.google_refresh_token = refresh_token
    db.session.commit()


def get_access_token(refresh_token: str) -> str:
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
    }
    res = requests.post(GOOGLE_TOKEN_URL, data=data)
    res.raise_for_status()
    return res.json()["access_token"]


def fetch_events_for_user(user: User):
    if not user.google_refresh_token:
        raise RuntimeError("Google not linked")

    access_token = get_access_token(user.google_refresh_token)
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {
        "singleEvents": True,
        "orderBy": "startTime",
        "maxResults": 100,
        "timeMin": "2000-01-01T00:00:00Z",
    }

    url = f"{GOOGLE_CALENDAR_API_BASE}/calendars/primary/events"
    res = requests.get(url, headers=headers, params=params)
    res.raise_for_status()

    items = res.json().get("items", [])
    events = []

    for item in items:
        start = item.get("start", {})
        end = item.get("end", {})

        events.append({
            "id": item.get("id"),
            "title": item.get("summary"),
            "start": start.get("dateTime") or start.get("date"),
            "end": end.get("dateTime") or end.get("date"),
        })

    return events


def create_event_for_user(user: User, title: str, start: str, end: Optional[str] = None):  # 🔹 여기 수정
    if not user.google_refresh_token:
        raise RuntimeError("Google not linked")

    access_token = get_access_token(user.google_refresh_token)
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
    body = {
        "summary": title,
        "start": {"dateTime": start},
        "end": {"dateTime": end or start},
    }

    url = f"{GOOGLE_CALENDAR_API_BASE}/calendars/primary/events"
    res = requests.post(url, headers=headers, json=body)
    res.raise_for_status()

    item = res.json()
    return {
        "id": item.get("id"),
        "title": item.get("summary"),
        "start": item["start"].get("dateTime") or item["start"].get("date"),
        "end": item["end"].get("dateTime") or item["end"].get("date"),
    }


def delete_event_for_user(user: User, event_id: str):
    if not user.google_refresh_token:
        raise RuntimeError("Google not linked")

    access_token = get_access_token(user.google_refresh_token)
    headers = {"Authorization": f"Bearer {access_token}"}
    url = f"{GOOGLE_CALENDAR_API_BASE}/calendars/primary/events/{event_id}"

    res = requests.delete(url, headers=headers)
    if res.status_code not in (200, 204):
        res.raise_for_status()
