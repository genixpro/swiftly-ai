"""Comparable portfolio workflows."""
from __future__ import annotations

from uuid import uuid4


def save_sale_portfolio(payload: dict, repositories, clean_payload) -> dict:
    """Persist a portfolio and its members while preserving existing identifiers."""
    raw_portfolio = payload.get("portfolio") or {}
    portfolio = clean_payload(raw_portfolio)
    portfolio_id = raw_portfolio.get("_id") or str(uuid4())
    portfolio.update(
        {
            "_id": portfolio_id,
            "owner": "local-demo",
            "isPortfolio": True,
            "subCompIds": [],
        }
    )
    for raw_comparable in payload.get("subComps") or []:
        comparable = clean_payload(raw_comparable)
        comparable_id = raw_comparable.get("_id") or str(uuid4())
        comparable.update(
            {
                "_id": comparable_id,
                "owner": "local-demo",
                "portfolioId": portfolio_id,
            }
        )
        repositories.comparable_sales.replace_one(
            {"_id": comparable_id}, comparable, upsert=True
        )
        portfolio["subCompIds"].append(comparable_id)
    repositories.comparable_sales.replace_one(
        {"_id": portfolio_id}, portfolio, upsert=True
    )
    return {"_id": portfolio_id, "subCompIds": portfolio["subCompIds"]}
