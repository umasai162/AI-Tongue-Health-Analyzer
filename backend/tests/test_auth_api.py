import uuid

def test_root_endpoint(client):
    res = client.get("/")
    assert res.status_code == 200
    assert "AI Tongue Health Analyzer" in res.json()["app"]

def test_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_user_registration_and_login(client):
    unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    reg_payload = {
        "name": "Dr. Test User",
        "email": unique_email,
        "password": "Password123!",
        "consent_disclaimer": True,
        "consent_retention": True
    }

    # Register
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    assert "access_token" in reg_res.json()
    token = reg_res.json()["access_token"]

    # Duplicate registration check
    dup_res = client.post("/api/auth/register", json=reg_payload)
    assert dup_res.status_code == 400

    # Login
    login_res = client.post("/api/auth/login", json={"email": unique_email, "password": "Password123!"})
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # Get /me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == unique_email
