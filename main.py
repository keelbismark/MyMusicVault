import sys
from pathlib import Path
import threading
import logging
import time
import requests
import webview

sys.path.insert(0, str(Path(__file__).parent / "backend"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FlaskServer:
    def __init__(self):
        self.server_thread = None

    def start(self):
        try:
            from backend.app import app
            self.server_thread = threading.Thread(
                target=lambda: app.run(
                    host='127.0.0.1',
                    port=5000,
                    debug=False,
                    use_reloader=False,
                    threaded=True
                ),
                daemon=True
            )
            self.server_thread.start()
            logger.info("Flask server started")
        except Exception as e:
            logger.error(f"Failed to start Flask server: {e}")
            raise

    @staticmethod
    def wait_until_ready(timeout=5):
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                response = requests.get("http://127.0.0.1:5000/", timeout=0.1)
                if response.status_code == 200:
                    logger.info("Server is ready")
                    return True
            except:
                time.sleep(0.01)
        return False


class MusicPlayerApp:
    def __init__(self):
        self.window = None
        self.flask_server = None

    def create_window(self):
        self.window = webview.create_window(
            title="My Music Vault",
            url='http://127.0.0.1:5000',
            width=1200,
            height=800,
            maximized=True,
            resizable=True,
            fullscreen=False,
            min_size=(800, 600),
            text_select=True,
            zoomable=False,
        )
        logger.info("Main window created")

    def start(self):
        logger.info("Starting server")
        self.flask_server = FlaskServer()
        self.flask_server.start()

        if not self.flask_server.wait_until_ready(timeout=10):
            logger.error("Server failed to start")
            return

        logger.info("Server ready, creating window")
        self.create_window()
        webview.start(gui='edgechromium', debug=False)


def main():
    MusicPlayerApp().start()
    return 0


if __name__ == "__main__":
    sys.exit(main())