import os

from setuptools import setup, find_packages
''
here = os.path.abspath(os.path.dirname(__file__))
with open(os.path.join(here, 'README.txt')) as f:
    README = f.read()
with open(os.path.join(here, 'CHANGES.txt')) as f:
    CHANGES = f.read()

requires = [
    'plaster_pastedeploy',
    'pyramid',
    'pyramid_jinja2',
    'pyramid_debugtoolbar',
    'waitress',
    'cornice',
    'pymongo',
    'pillow',
    'azure-storage',
    'filetype',
    'python-docx'
]

tests_require = [
    'WebTest >= 1.3.1',  # py3 compat
    'pytest >= 3.7.4',
    'pytest-cov',
]

setup(
    name='appraisal',
    version='0.0',
    description='appraisal',
    long_description=README + '\n\n' + CHANGES,
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Pyramid',
        'Topic :: Internet :: WWW/HTTP',
        'Topic :: Internet :: WWW/HTTP :: WSGI :: Application',
    ],
    author='',
    author_email='',
    url='',
    keywords='web pyramid pylons',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    extras_require={
        'testing': tests_require,
    },
    install_requires=requires,
    entry_points={
        'paste.app_factory': [
            'main = appraisal:main',
        ],
        'console_scripts': [
            'appraisal_train_classifier = appraisal.bin.train_document_classifier:main',
            'appraisal_generate_documents = appraisal.bin.generate_documents:main',
            'appraisal_train_extractor = appraisal.bin.train_document_extractor:main'
        ]
    },
)
