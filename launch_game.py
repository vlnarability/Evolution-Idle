#!/usr/bin/env python3

import argparse
import functools
import http.server
import socket
import socketserver
import sys
import threading
import time
import webbrowser
from pathlib import Path


DEFAULT_PORT = 8765


class ReusableTcpServer(socketserver.TCPServer):
    allow_reuse_address = True


def port_is_open(host, port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
        probe.settimeout(0.25)
        return probe.connect_ex((host, port)) == 0


def main():
    parser = argparse.ArgumentParser(description="Serve Evolution Idle locally and open it in a browser.")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help=f"Port to serve on. Default: {DEFAULT_PORT}")
    parser.add_argument("--host", default="127.0.0.1", help="Host/interface to bind. Default: 127.0.0.1")
    parser.add_argument("--browser", default=None, help='Optional browser command, for example "firefox".')
    parser.add_argument("--no-open", action="store_true", help="Start the server without opening a browser.")
    args = parser.parse_args()

    root = Path(__file__).resolve().parent
    url = f"http://{args.host}:{args.port}/index.html"

    if port_is_open(args.host, args.port):
        print(f"Port {args.port} already has a server. Opening {url}")
        if not args.no_open:
            if args.browser:
                webbrowser.get(args.browser).open(url)
            else:
                webbrowser.open(url)
        return 0

    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(root))

    try:
        with ReusableTcpServer((args.host, args.port), handler) as httpd:
            print(f"Serving {root}")
            print(f"Open {url}")
            print("Press Ctrl+C to stop.")

            if not args.no_open:
                opener = webbrowser.get(args.browser) if args.browser else webbrowser
                threading.Timer(0.5, lambda: opener.open(url)).start()

            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        time.sleep(0.1)
        return 0
    except OSError as exc:
        print(f"Could not start server on {args.host}:{args.port}: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
