import os

from flask import Flask


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY = 'dev',
        DATABASE = os.path.join(app.instance_path, 'snip_vault.sqlite')
    )

    os.makedirs(app.instance_path, exist_ok=True)

    from . import snippet_vault
    app.register_blueprint(snippet_vault.bp)
    app.add_url_rule("/", endpoint="index", view_func=snippet_vault.index)

    from . import auth
    app.register_blueprint(auth.bp)

    from . import db
    db.init_app(app)

    return app
