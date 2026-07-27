import os

class Config:
    BASE_URL = os.environ.get("BASE_URL", "https://vemanibhargav.github.io/foodrescue-web/")
    BROWSER = "chrome"
    HEADLESS = True
    IMPLICIT_WAIT = 10
    EXPLICIT_WAIT = 20
    SCREENSHOT_ON_FAILURE = True
    LOG_LEVEL = "INFO"
