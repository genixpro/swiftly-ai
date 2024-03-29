import os

from setuptools import setup, find_packages
''
here = os.path.abspath(os.path.dirname(__file__))
with open(os.path.join(here, 'README.txt')) as f:
    README = f.read()
with open(os.path.join(here, 'CHANGES.txt')) as f:
    CHANGES = f.read()
with open('requirements.txt', 'rt') as f:
    requires = f.readlines()

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
    package_data={
        'appraisal': [
            'tests/data/*.json',
            "gcloud-storage-key.json",
            "model_configuration/*.json"
        ]
    },
    install_requires=requires,
    entry_points={
        'paste.app_factory': [
            'main = appraisal:main',
        ],
        'console_scripts': [
            'appraisal_train_classifier = appraisal.bin.train_document_classifier:main',
            'appraisal_generate_documents = appraisal.bin.generate_documents:main',
            'appraisal_generate_extraction_data = appraisal.bin.generate_extraction_data:main',
            'appraisal_train_extractor = appraisal.bin.train_document_extractor:main',
            'appraisal_train_page_classifier = appraisal.bin.train_page_classifier:main',
            'appraisal_run_tests = appraisal.bin.run_tests:main',
            'appraisal_load_test_cases = appraisal.bin.load_test_cases:main',
            'appraisal_load_sample_data = appraisal.bin.load_sample_data:main',
            'appraisal_save_sample_data = appraisal.bin.save_sample_data:main',
            'appraisal_dump_files = appraisal.bin.dump_files:main',
            'appraisal_import_files = appraisal.bin.import_files:main',
            'appraisal_run_migrations = appraisal.bin.run_migrations:main',
            'appraisal_update_property_tag_stats = appraisal.bin.update_property_tag_stats:main',
            'appraisal_generate_demo_unique_links = appraisal.bin.generate_demo_unique_links:main',
            'appraisal_refresh_sandbox_accounts = appraisal.bin.refresh_sandbox_accounts:main',
            'appraisal_lock_demo_owner= appraisal.bin.lock_demo_owner:main',
        ]
    },
)

