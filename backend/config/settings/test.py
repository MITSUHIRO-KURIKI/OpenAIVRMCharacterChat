from datetime import timedelta

# config/settings/base.py
def update_debug_settings() -> bool:
    TEST_DEBUG = False
    print('*'*15,' TEST settings ','*'*15)
    print(f' - DEBUG={TEST_DEBUG}')
    print('*'*47)
    return TEST_DEBUG

# config/settings/api_settings/Jwt.py
def update_jwt_settings(SIMPLE_JWT:dict) -> dict:
    """
    Modify SIMPLE_JWT settings for test environment.
    """
    # use file
    ## tests/accounts/api/jwt/create/test.py
    SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']  = timedelta(seconds=1)
    SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'] = timedelta(seconds=3)
    print('*'*15,' TEST settings ','*'*15)
    print(f" - ACCESS_TOKEN_LIFETIME({SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']})\n - REFRESH_TOKEN_LIFETIME({SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']})")
    print('*'*47)
    return SIMPLE_JWT