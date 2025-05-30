import logging

class GCPClient:
    def __init__(self, config):
        self.project_id = config.get('project_id')
        self.service_account_json = config.get('service_account_json')
        logging.info(f'GCPClient initialized for project {self.project_id}')

    # TODO: Add methods for deploying, monitoring, etc. 