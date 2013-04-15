if __name__ == "__main__" and (__package__ is None or __package__ == ""):
  import os, sys
  parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
  sys.path.insert(0, parent_dir)
  import ggrc
  __package__ = "ggrc"
  del os, sys

from . import app

host = app.config.get("HOST") or "0.0.0.0"
port = app.config.get("PORT") or 8080
app.run(host=host, port=port)