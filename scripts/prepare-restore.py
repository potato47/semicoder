"""Prepare a trusted D1 SQL export for restoration into a new, empty database."""

import os
import sqlite3
import sys
from pathlib import Path


def prepare(source: str) -> str:
    statements = []
    pending = ""
    for line in source.splitlines(keepends=True):
        pending += line
        if sqlite3.complete_statement(pending):
            statements.append(pending.strip())
            pending = ""
    if pending.strip():
        raise ValueError("Incomplete SQL statement in export")
    schema = []
    data = []
    for statement in statements:
        # D1 exports child table data before some referenced tables exist.
        # Deferred checks require every table to exist before inserting rows.
        (schema if statement.upper().startswith("CREATE ") else data).append(statement)
    if not schema:
        raise ValueError("Export contains no schema")
    return "PRAGMA defer_foreign_keys=TRUE;\n" + "\n".join(schema + data) + "\n"


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python3 scripts/prepare-restore.py INPUT.sql OUTPUT.sql")
    output = prepare(Path(sys.argv[1]).read_text())
    # Never overwrite a backup; restored SQL contains private authentication data.
    descriptor = os.open(sys.argv[2], os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, "w") as target:
        target.write(output)
    print("Prepared restore SQL; original backup unchanged.")
