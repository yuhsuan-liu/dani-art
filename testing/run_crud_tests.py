#!/usr/bin/env python3
"""
Dani's Art Registry — backend CRUD + connectivity test suite.

Runs against:
  - Supabase Postgres (direct, service role)
  - FastAPI HTTP routes (in-process TestClient)

Usage (from repo root):
  cd backend && source venv/bin/activate
  python ../testing/run_crud_tests.py

Optional:
  API_BASE_URL=http://localhost:8000 python ../testing/run_crud_tests.py
  (uses live server instead of TestClient)

Exit code 0 = all passed, 1 = one or more failures.
"""

from __future__ import annotations

import json
import os
import sys
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

# Load backend .env and import app
REPO_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = REPO_ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv

load_dotenv(BACKEND_DIR / ".env")

try:
    from fastapi.testclient import TestClient
except ImportError:
    print("ERROR: Install backend deps first (pip install -r backend/requirements.txt)")
    sys.exit(1)

from app.services.supabase import supabase  # noqa: E402
from main import app  # noqa: E402

RUN_ID = uuid.uuid4().hex[:8]
TEST_EMAIL = f"crud-test-{RUN_ID}@example.com"
PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400"


@dataclass
class CheckResult:
    name: str
    passed: bool
    detail: str = ""


@dataclass
class Section:
    title: str
    checks: list[CheckResult] = field(default_factory=list)

    @property
    def passed(self) -> int:
        return sum(1 for c in self.checks if c.passed)

    @property
    def total(self) -> int:
        return len(self.checks)


class Report:
    def __init__(self) -> None:
        self.sections: list[Section] = []
        self._current: Section | None = None

    def section(self, title: str) -> None:
        self._current = Section(title=title)
        self.sections.append(self._current)

    def ok(self, name: str, detail: str = "") -> None:
        assert self._current
        self._current.checks.append(CheckResult(name, True, detail))

    def fail(self, name: str, detail: str = "") -> None:
        assert self._current
        self._current.checks.append(CheckResult(name, False, detail))

    def run(self, name: str, fn: Callable[[], None]) -> None:
        try:
            fn()
            self.ok(name)
        except AssertionError as exc:
            self.fail(name, str(exc))
        except Exception as exc:  # noqa: BLE001 — test harness
            self.fail(name, f"{type(exc).__name__}: {exc}")

    @property
    def all_passed(self) -> bool:
        return all(c.passed for s in self.sections for c in s.checks)

    def print_report(self) -> None:
        width = 78
        print("=" * width)
        print("DANI ART REGISTRY — BACKEND CRUD TEST REPORT")
        print("=" * width)
        print(f"Run ID:    {RUN_ID}")
        print(f"Started:   {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}")
        print(f"Supabase:  {os.getenv('SUPABASE_URL', '(missing)')}")
        print()

        for idx, section in enumerate(self.sections, start=1):
            print(f"[{idx}/{len(self.sections)}] {section.title}")
            print("-" * width)
            for check in section.checks:
                icon = "PASS" if check.passed else "FAIL"
                line = f"  [{icon}] {check.name}"
                print(line)
                if check.detail:
                    for part in check.detail.splitlines():
                        print(f"         {part}")
            print(f"  → {section.passed}/{section.total} passed")
            print()

        total_pass = sum(s.passed for s in self.sections)
        total = sum(s.total for s in self.sections)
        failed = total - total_pass
        print("=" * width)
        if failed == 0:
            print(f"RESULT: ALL PASSED ({total_pass}/{total})")
        else:
            print(f"RESULT: {failed} FAILURE(S) — {total_pass}/{total} passed")
        print("=" * width)


def assert_status(response, expected: int, label: str) -> dict[str, Any]:
    if response.status_code != expected:
        body = response.text[:500]
        raise AssertionError(f"{label}: expected HTTP {expected}, got {response.status_code}\n{body}")
    if response.status_code == 204:
        return {}
    try:
        return response.json()
    except json.JSONDecodeError:
        return {"raw": response.text}


class CrudTester:
    def __init__(self, report: Report) -> None:
        self.report = report
        self.client = TestClient(app)
        self.ids: dict[str, str] = {}

    def run_all(self) -> None:
        self._test_infrastructure()
        self._test_users()
        self._test_rooms()
        self._test_artwork()
        self._test_furniture()
        self._test_orders()
        self._test_blog_posts_db()
        self._test_storage()
        self._cleanup()

    def _test_infrastructure(self) -> None:
        self.report.section("INFRASTRUCTURE & CONNECTIVITY")

        def env_vars() -> None:
            assert os.getenv("SUPABASE_URL"), "SUPABASE_URL not set in backend/.env"
            assert os.getenv("SUPABASE_KEY"), "SUPABASE_KEY not set in backend/.env"

        self.report.run("Environment variables (SUPABASE_URL, SUPABASE_KEY)", env_vars)

        def db_ping() -> None:
            result = supabase.table("users").select("id").limit(1).execute()
            assert result.data is not None, "users query returned None"

        self.report.run("Supabase DB connection (SELECT users LIMIT 1)", db_ping)

        def health() -> None:
            data = assert_status(self.client.get("/health"), 200, "GET /health")
            assert data.get("status") == "healthy", data

        self.report.run("API GET /health", health)

        def root() -> None:
            data = assert_status(self.client.get("/"), 200, "GET /")
            assert "message" in data, data

        self.report.run("API GET /", root)

        for table in ("users", "rooms", "artwork", "furniture", "orders", "blog_posts"):
            def check_table(t: str = table) -> None:
                supabase.table(t).select("*").limit(1).execute()

            self.report.run(f"Table readable: {table}", check_table)

    def _test_users(self) -> None:
        self.report.section("USERS — CRUD & FIELD UPDATES")

        def create() -> None:
            payload = {
                "email": TEST_EMAIL,
                "name": "CRUD Test Artist",
                "bio": "Automated test user",
                "profile_pic_url": PLACEHOLDER_IMAGE,
                "role": "artist",
            }
            data = assert_status(self.client.post("/api/users/", json=payload), 200, "POST /api/users/")
            self.ids["user_id"] = data["id"]
            for key in ("email", "name", "bio", "role"):
                assert data.get(key) == payload[key], f"create mismatch on {key}: {data}"

        self.report.run("CREATE user (all fields)", create)

        def read_one() -> None:
            uid = self.ids["user_id"]
            data = assert_status(self.client.get(f"/api/users/{uid}"), 200, "GET /api/users/{id}")
            assert data["email"] == TEST_EMAIL

        self.report.run("READ user by id", read_one)

        def read_list() -> None:
            data = assert_status(self.client.get("/api/users/"), 200, "GET /api/users/")
            assert isinstance(data, list)

        self.report.run("READ users list", read_list)

        def read_artists() -> None:
            data = assert_status(self.client.get("/api/users/artists"), 200, "GET /api/users/artists")
            assert isinstance(data, list)

        self.report.run("READ artists list", read_artists)

        def read_by_email() -> None:
            data = assert_status(
                self.client.get(f"/api/users/email/{TEST_EMAIL}"),
                200,
                "GET /api/users/email/{email}",
            )
            assert data["id"] == self.ids["user_id"]

        self.report.run("READ user by email", read_by_email)

        field_updates = {
            "name": "CRUD Test Artist Updated",
            "bio": "Updated bio",
            "profile_pic_url": PLACEHOLDER_IMAGE + "&v=2",
            "role": "artist",
        }
        for field_name, value in field_updates.items():
            def update_field(f: str = field_name, v: Any = value) -> None:
                uid = self.ids["user_id"]
                data = assert_status(
                    self.client.patch(f"/api/users/{uid}", json={f: v}),
                    200,
                    f"PATCH users.{f}",
                )
                assert data[f] == v, f"expected {f}={v}, got {data.get(f)}"

            self.report.run(f"UPDATE users.{field_name}", update_field)

    def _test_rooms(self) -> None:
        self.report.section("ROOMS — CRUD & FIELD UPDATES")

        def create() -> None:
            payload = {
                "user_id": self.ids["user_id"],
                "name": "Test Living Room",
                "order": 0,
                "background_url": PLACEHOLDER_IMAGE,
                "width": 800,
                "height": 560,
            }
            data = assert_status(self.client.post("/api/rooms/", json=payload), 200, "POST /api/rooms/")
            self.ids["room_id"] = data["id"]
            assert data["name"] == payload["name"]

        self.report.run("CREATE room (all fields)", create)

        def read() -> None:
            rid = self.ids["room_id"]
            data = assert_status(self.client.get(f"/api/rooms/{rid}"), 200, "GET /api/rooms/{id}")
            assert data["user_id"] == self.ids["user_id"]

        self.report.run("READ room by id", read)

        def read_via_user() -> None:
            uid = self.ids["user_id"]
            data = assert_status(
                self.client.get(f"/api/users/{uid}/rooms"),
                200,
                "GET /api/users/{id}/rooms",
            )
            assert any(r["id"] == self.ids["room_id"] for r in data)

        self.report.run("READ rooms via user", read_via_user)

        field_updates = {
            "name": "Test Drum Studio",
            "order": 1,
            "background_url": PLACEHOLDER_IMAGE + "&room=1",
            "width": 900,
            "height": 600,
        }
        for field_name, value in field_updates.items():
            def update_field(f: str = field_name, v: Any = value) -> None:
                rid = self.ids["room_id"]
                data = assert_status(
                    self.client.patch(f"/api/rooms/{rid}", json={f: v}),
                    200,
                    f"PATCH rooms.{f}",
                )
                assert data[f] == v, f"expected {f}={v}, got {data.get(f)}"

            self.report.run(f"UPDATE rooms.{field_name}", update_field)

    def _test_artwork(self) -> None:
        self.report.section("ARTWORK — CRUD & FIELD UPDATES")

        def create() -> None:
            payload = {
                "user_id": self.ids["user_id"],
                "title": "Test Sunset",
                "description": "CRUD test piece",
                "price": 250.0,
                "image_url": PLACEHOLDER_IMAGE,
                "medium": "Oil on canvas",
                "dimensions": "24x36",
                "status": "available",
            }
            data = assert_status(self.client.post("/api/artwork/", json=payload), 200, "POST /api/artwork/")
            self.ids["artwork_id"] = data["id"]
            assert data["title"] == payload["title"]

        self.report.run("CREATE artwork (all fields)", create)

        def read_one() -> None:
            aid = self.ids["artwork_id"]
            data = assert_status(self.client.get(f"/api/artwork/{aid}"), 200, "GET /api/artwork/{id}")
            assert data["user_id"] == self.ids["user_id"]

        self.report.run("READ artwork by id", read_one)

        def read_list() -> None:
            data = assert_status(self.client.get("/api/artwork/"), 200, "GET /api/artwork/")
            assert isinstance(data, list)

        self.report.run("READ artwork list", read_list)

        def read_filtered() -> None:
            uid = self.ids["user_id"]
            data = assert_status(
                self.client.get(f"/api/artwork/?user_id={uid}&status=available"),
                200,
                "GET /api/artwork/?user_id&status",
            )
            assert any(a["id"] == self.ids["artwork_id"] for a in data)

        self.report.run("READ artwork filtered", read_filtered)

        def read_via_user() -> None:
            uid = self.ids["user_id"]
            data = assert_status(
                self.client.get(f"/api/users/{uid}/artwork"),
                200,
                "GET /api/users/{id}/artwork",
            )
            assert any(a["id"] == self.ids["artwork_id"] for a in data)

        self.report.run("READ artwork via user", read_via_user)

        field_updates = {
            "title": "Test Sunset Updated",
            "description": "Updated description",
            "price": 275.0,
            "image_url": PLACEHOLDER_IMAGE + "&art=1",
            "medium": "Acrylic",
            "dimensions": "30x40",
            "status": "reserved",
        }
        for field_name, value in field_updates.items():
            def update_field(f: str = field_name, v: Any = value) -> None:
                aid = self.ids["artwork_id"]
                data = assert_status(
                    self.client.patch(f"/api/artwork/{aid}", json={f: v}),
                    200,
                    f"PATCH artwork.{f}",
                )
                assert data[f] == v, f"expected {f}={v}, got {data.get(f)}"

            self.report.run(f"UPDATE artwork.{field_name}", update_field)

        # Reset status for order tests
        def reset_status() -> None:
            aid = self.ids["artwork_id"]
            assert_status(
                self.client.patch(f"/api/artwork/{aid}", json={"status": "available"}),
                200,
                "PATCH artwork.status reset",
            )

        self.report.run("UPDATE artwork.status → available (for order test)", reset_status)

    def _test_furniture(self) -> None:
        self.report.section("FURNITURE — CRUD & FIELD UPDATES")

        def create() -> None:
            payload = {
                "room_id": self.ids["room_id"],
                "name": "Test Couch",
                "image_url": PLACEHOLDER_IMAGE,
                "price": 400.0,
                "position_x": 100,
                "position_y": 120,
                "width": 200,
                "height": 110,
                "rotation": 0,
                "z_index": 1,
                "external_url": "https://example.com/couch",
                "artwork_id": self.ids["artwork_id"],
                "status": "available",
            }
            data = assert_status(
                self.client.post("/api/furniture/", json=payload),
                200,
                "POST /api/furniture/",
            )
            self.ids["furniture_id"] = data["id"]
            assert data["name"] == payload["name"]

        self.report.run("CREATE furniture (all fields)", create)

        def read_one() -> None:
            fid = self.ids["furniture_id"]
            data = assert_status(
                self.client.get(f"/api/furniture/{fid}"),
                200,
                "GET /api/furniture/{id}",
            )
            assert data["room_id"] == self.ids["room_id"]

        self.report.run("READ furniture by id", read_one)

        def read_room_furniture() -> None:
            rid = self.ids["room_id"]
            data = assert_status(
                self.client.get(f"/api/rooms/{rid}/furniture"),
                200,
                "GET /api/rooms/{id}/furniture",
            )
            assert any(f["id"] == self.ids["furniture_id"] for f in data)

        self.report.run("READ furniture via room", read_room_furniture)

        field_updates = {
            "name": "Test Couch Updated",
            "image_url": PLACEHOLDER_IMAGE + "&furn=1",
            "price": 425.0,
            "position_x": 150,
            "position_y": 180,
            "width": 220,
            "height": 120,
            "rotation": 15,
            "z_index": 2,
            "external_url": "https://example.com/couch-updated",
            "status": "reserved",
        }
        for field_name, value in field_updates.items():
            def update_field(f: str = field_name, v: Any = value) -> None:
                fid = self.ids["furniture_id"]
                data = assert_status(
                    self.client.patch(f"/api/furniture/{fid}", json={f: v}),
                    200,
                    f"PATCH furniture.{f}",
                )
                assert data[f] == v, f"expected {f}={v}, got {data.get(f)}"

            self.report.run(f"UPDATE furniture.{field_name}", update_field)

        def update_position_endpoint() -> None:
            fid = self.ids["furniture_id"]
            data = assert_status(
                self.client.patch(
                    f"/api/furniture/{fid}/position?position_x=200&position_y=220"
                ),
                200,
                "PATCH /api/furniture/{id}/position",
            )
            assert data["position_x"] == 200 and data["position_y"] == 220

        self.report.run("UPDATE furniture position (drag endpoint)", update_position_endpoint)

        def reset_status() -> None:
            fid = self.ids["furniture_id"]
            assert_status(
                self.client.patch(f"/api/furniture/{fid}", json={"status": "available"}),
                200,
                "PATCH furniture.status reset",
            )

        self.report.run("UPDATE furniture.status → available (for order test)", reset_status)

    def _test_orders(self) -> None:
        self.report.section("ORDERS — CRUD & FIELD UPDATES")

        def create() -> None:
            payload = {
                "artwork_id": self.ids["artwork_id"],
                "furniture_id": self.ids["furniture_id"],
                "customer_id": self.ids["user_id"],
                "customer_name": "Test Customer",
                "customer_email": f"customer-{RUN_ID}@example.com",
                "customer_phone": "555-0100",
                "delivery_type": "shipping",
                "shipping_address": {
                    "street": "123 Test St",
                    "city": "Monterey",
                    "state": "CA",
                    "zip": "93940",
                },
                "special_instructions": "Handle with care",
                "total_amount": 450.0,
                "shipping_fee": 30.0,
                "payment_method": "venmo",
            }
            data = assert_status(self.client.post("/api/orders/", json=payload), 200, "POST /api/orders/")
            self.ids["order_id"] = data["id"]
            assert data["customer_name"] == payload["customer_name"]
            assert data["status"] == "pending"

        self.report.run("CREATE order (all fields)", create)

        def verify_side_effects() -> None:
            aid = self.ids["artwork_id"]
            fid = self.ids["furniture_id"]
            art = assert_status(self.client.get(f"/api/artwork/{aid}"), 200, "artwork after order")
            furn = assert_status(self.client.get(f"/api/furniture/{fid}"), 200, "furniture after order")
            assert art["status"] == "reserved", art
            assert furn["status"] == "reserved", furn

        self.report.run("Order side-effect: artwork & furniture → reserved", verify_side_effects)

        def read_one() -> None:
            oid = self.ids["order_id"]
            data = assert_status(self.client.get(f"/api/orders/{oid}"), 200, "GET /api/orders/{id}")
            assert data["artwork_id"] == self.ids["artwork_id"]

        self.report.run("READ order by id", read_one)

        def read_list() -> None:
            data = assert_status(self.client.get("/api/orders/"), 200, "GET /api/orders/")
            assert isinstance(data, list)

        self.report.run("READ orders list", read_list)

        def update_status() -> None:
            oid = self.ids["order_id"]
            data = assert_status(
                self.client.patch(f"/api/orders/{oid}", json={"status": "confirmed"}),
                200,
                "PATCH orders.status",
            )
            assert data["status"] == "confirmed"

        self.report.run("UPDATE orders.status → confirmed", update_status)

        def verify_confirmed_side_effects() -> None:
            aid = self.ids["artwork_id"]
            fid = self.ids["furniture_id"]
            art = assert_status(self.client.get(f"/api/artwork/{aid}"), 200, "artwork confirmed")
            furn = assert_status(self.client.get(f"/api/furniture/{fid}"), 200, "furniture confirmed")
            assert art["status"] == "sold", art
            assert furn["status"] == "purchased", furn

        self.report.run("Order side-effect: confirmed → sold/purchased", verify_confirmed_side_effects)

        def update_payment_ref() -> None:
            oid = self.ids["order_id"]
            data = assert_status(
                self.client.patch(
                    f"/api/orders/{oid}",
                    json={"payment_reference": f"venmo-{RUN_ID}"},
                ),
                200,
                "PATCH orders.payment_reference",
            )
            assert data["payment_reference"] == f"venmo-{RUN_ID}"

        self.report.run("UPDATE orders.payment_reference", update_payment_ref)

    def _test_blog_posts_db(self) -> None:
        """blog_posts has no API router yet — test DB CRUD directly."""
        self.report.section("BLOG POSTS — DIRECT DB CRUD (no API router yet)")

        blog_id: dict[str, str] = {}

        def create() -> None:
            row = {
                "user_id": self.ids["user_id"],
                "title": "CRUD Test Post",
                "content": "Automated test content",
                "featured_image_url": PLACEHOLDER_IMAGE,
                "category": "general",
                "is_published": False,
            }
            result = supabase.table("blog_posts").insert(row).execute()
            assert result.data, result
            blog_id["id"] = result.data[0]["id"]

        self.report.run("CREATE blog_posts (direct DB)", create)

        field_updates = {
            "title": "CRUD Test Post Updated",
            "content": "Updated content body",
            "featured_image_url": PLACEHOLDER_IMAGE + "&blog=1",
            "category": "art_fair",
            "is_published": True,
        }
        for field_name, value in field_updates.items():
            def update_field(f: str = field_name, v: Any = value) -> None:
                result = (
                    supabase.table("blog_posts")
                    .update({f: v})
                    .eq("id", blog_id["id"])
                    .execute()
                )
                assert result.data, result
                assert result.data[0][f] == v, result.data[0]

            self.report.run(f"UPDATE blog_posts.{field_name} (direct DB)", update_field)

        def read() -> None:
            result = (
                supabase.table("blog_posts")
                .select("*")
                .eq("id", blog_id["id"])
                .single()
                .execute()
            )
            assert result.data["title"] == "CRUD Test Post Updated"

        self.report.run("READ blog_posts (direct DB)", read)

        def delete() -> None:
            supabase.table("blog_posts").delete().eq("id", blog_id["id"]).execute()

        self.report.run("DELETE blog_posts (direct DB)", delete)

    def _test_storage(self) -> None:
        self.report.section("SUPABASE STORAGE")

        def list_buckets() -> None:
            buckets = supabase.storage.list_buckets()
            names = {b.name for b in buckets}
            for expected in ("artwork", "furniture", "profiles", "blog"):
                assert expected in names, f"Missing bucket '{expected}'. Found: {sorted(names)}"

        self.report.run("Storage buckets exist (artwork, furniture, profiles, blog)", list_buckets)

    def _cleanup(self) -> None:
        self.report.section("CLEANUP (delete test records)")

        def delete_order() -> None:
            if "order_id" not in self.ids:
                return
            assert_status(
                self.client.patch(
                    f"/api/orders/{self.ids['order_id']}",
                    json={"status": "cancelled"},
                ),
                200,
                "cancel order before delete",
            )
            # Orders have no DELETE endpoint — remove via DB
            supabase.table("orders").delete().eq("id", self.ids["order_id"]).execute()

        self.report.run("DELETE test order", delete_order)

        def delete_furniture() -> None:
            if "furniture_id" not in self.ids:
                return
            assert_status(
                self.client.delete(f"/api/furniture/{self.ids['furniture_id']}"),
                200,
                "DELETE furniture",
            )

        self.report.run("DELETE test furniture", delete_furniture)

        def delete_artwork() -> None:
            if "artwork_id" not in self.ids:
                return
            assert_status(
                self.client.delete(f"/api/artwork/{self.ids['artwork_id']}"),
                200,
                "DELETE artwork",
            )

        self.report.run("DELETE test artwork", delete_artwork)

        def delete_room() -> None:
            if "room_id" not in self.ids:
                return
            assert_status(
                self.client.delete(f"/api/rooms/{self.ids['room_id']}"),
                200,
                "DELETE room",
            )

        self.report.run("DELETE test room", delete_room)

        def delete_user() -> None:
            if "user_id" not in self.ids:
                return
            supabase.table("users").delete().eq("id", self.ids["user_id"]).execute()

        self.report.run("DELETE test user (direct DB — no DELETE API)", delete_user)


def main() -> int:
    report = Report()
    tester = CrudTester(report)
    tester.run_all()
    report.print_report()
    return 0 if report.all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
