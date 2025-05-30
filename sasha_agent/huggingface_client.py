import logging

class HuggingFaceClient:
    def __init__(self, api_key):
        self.api_key = api_key
        logging.info('HuggingFaceClient initialized.')

    # TODO: Add methods for running models, etc. 