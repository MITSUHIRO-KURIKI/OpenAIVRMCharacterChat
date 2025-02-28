from django.conf import settings

# LOAD SECRET STEEINGS
from config.settings.read_env import read_env
env = read_env(settings.BASE_DIR)

# OpenAI
try:    OPENAI_API_KEY = env.get_value('OPENAI_API_KEY',str)
except: OPENAI_API_KEY = None
# Azure
## Azure OpenAI Service
try:    AZURE_OPENAI_API_KEY = env.get_value('AZURE_OPENAI_API_KEY',str)
except: AZURE_OPENAI_API_KEY = None
try:    AZURE_OPENAI_ENDPOINT = env.get_value('AZURE_OPENAI_ENDPOINT',str)
except: AZURE_OPENAI_ENDPOINT = None
try:    AZURE_OPENAI_API_VERSION = env.get_value('AZURE_OPENAI_API_VERSION',str)
except: AZURE_OPENAI_API_VERSION = None
## Azure Speech services
try:    AZURE_SPEECH_SERVICES_SUBSCRIPTION_KEY = env.get_value('AZURE_SPEECH_SERVICES_SUBSCRIPTION_KEY',str)
except: AZURE_SPEECH_SERVICES_SUBSCRIPTION_KEY = None
try:    AZURE_SPEECH_SERVICES_REGION = env.get_value('AZURE_SPEECH_SERVICES_REGION',str)
except: AZURE_SPEECH_SERVICES_REGION = None
# GCP
## LLMs
try:    GCLOUD_PROJECT_NAME = env.get_value('GCLOUD_PROJECT_NAME',str)
except: GCLOUD_PROJECT_NAME = None
try:    GCLOUD_LOCATION_NAME = env.get_value('GCLOUD_LOCATION_NAME',str)
except: GCLOUD_LOCATION_NAME = None