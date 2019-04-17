#!/bin/bash
cd /home/bradley/eb-appraisal/server
source venv/bin/activate
gunicorn -t 600 -w 1 -u bradley -g bradley -b 0.0.0.0:5000 --paste production.ini

