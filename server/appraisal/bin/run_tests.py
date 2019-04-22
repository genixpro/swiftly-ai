import unittest

def main():
    suite = unittest.defaultTestLoader.discover("appraisal", "*_test.py")
    runner = unittest.TextTestRunner()
    runner.run(suite)

