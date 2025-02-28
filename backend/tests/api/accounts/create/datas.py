def api_create_account():
    data = {
        # 有効なデータ
        'valid': {
            'params': {
                'email':       'test@test.com',
                'password':    'bqKXhKQR6AxE',
                're_password': 'bqKXhKQR6AxE',
            },
            'response': {
                'status_code': 201,
            },
        },
        # 空欄
        'blank_email_': {
            'params': {
                'email':       '',
                'password':    'bqKXhKQR6AxE',
                're_password': 'bqKXhKQR6AxE',
            },
            'response': {
                'status_code': 400,
                'type':        'validation_error',
                'errors':      {'code': 'invalid', 'attr': 'email'},
            },
        },
        'blank_password_': {
            'params': {
                'email':       'test@test.com',
                'password':    '',
                're_password': 'bqKXhKQR6AxE',
            },
            'response': {
                'status_code': 400,
                'type':        'validation_error',
                'errors':      {'code': 'blank', 'attr': 'password'},
            },
        },
        'blank_re_password_': {
            'params': {
                'email':       'test@test.com',
                'password':    'bqKXhKQR6AxE',
                're_password': '',
            },
            'response': {
                'status_code': 400,
                'type':        'validation_error',
                'errors':      {'code': 'blank', 'attr': 're_password'},
            },
        },
        # 無効なデータ(メールアドレス)
        'invalid_email_missing_domain': {
            'params': {
                'email':       'test',
                'password':    'bqKXhKQR6AxE',
                're_password': 'bqKXhKQR6AxE',
            },
            'response': {
                'status_code': 400,
                'type':        'validation_error',
                'errors':      {'code': 'invalid', 'attr': 'email'},
            },
        },
        'invalid_email_missing_tld': {
            'params': {
                'email':       'test@',
                'password':    'bqKXhKQR6AxE',
                're_password': 'bqKXhKQR6AxE',
            },
            'response': {
                'status_code': 400,
                'type':        'validation_error',
                'errors':      {'code': 'invalid', 'attr': 'email'},
            },
        },
        'invalid_email_missing_username': {
            'params': {
                'email':       '@test.com',
                'password':    'bqKXhKQR6AxE',
                're_password': 'bqKXhKQR6AxE',
            },
            'response': {
                'status_code': 400,
                'type':        'validation_error',
                'errors':      {'code': 'invalid', 'attr': 'email'},
            },
        },
        'invalid_email_special_character': {
            'params': {
                'email':       'test@test!.com',
                'password':    'bqKXhKQR6AxE',
                're_password': 'bqKXhKQR6AxE',
            },
            'response': {
                'status_code': 400,
                'type':        'validation_error',
                'errors':      {'code': 'invalid', 'attr': 'email'},
            },
        },
        'invalid_email_short_tld': {
            'params': {
                'email':       'test@test.c',
                'password':    'bqKXhKQR6AxE',
                're_password': 'bqKXhKQR6AxE',
            },
            'response': {
                'status_code': 400,
                'type':        'validation_error',
                'errors':      {'code': 'invalid', 'attr': 'email'},
            },
        },
        'invalid_email_double_dots': {
            'params': {
                'email':       'test..test@test.com',
                'password':    'bqKXhKQR6AxE',
                're_password': 'bqKXhKQR6AxE',
            },
            'response': {
                'status_code': 400,
                'type':        'validation_error',
                'errors':      {'code': 'invalid', 'attr': 'email'},
            },
        },
        'invalid_email_starting_with_dot': {
            'params': {
                'email':       '.test@test.com',
                'password':    'bqKXhKQR6AxE',
                're_password': 'bqKXhKQR6AxE',
            },
            'response': {
                'status_code': 400,
                'type':        'validation_error',
                'errors':      {'code': 'invalid', 'attr': 'email'},
            },
        },
        'invalid_email_non_ascii': {
            'params': {
                'email':       'テスト@test.com',
                'password':    'bqKXhKQR6AxE',
                're_password': 'bqKXhKQR6AxE',
            },
            'response': {
                'status_code': 400,
                'type':        'validation_error',
                'errors':      {'code': 'invalid', 'attr': 'email'},
            },
        },
        'invalid_email_with_space': {
            'params': {
                'email':       'test @test.com',
                'password':    'bqKXhKQR6AxE',
                're_password': 'bqKXhKQR6AxE',
            },
            'response': {
                'status_code': 400,
                'type':        'validation_error',
                'errors':      {'code': 'invalid', 'attr': 'email'},
            },
        },
        # 無効なデータ(パスワード)
        'invalid_password_too_short': {
            'params': {
                'email':       'test@test.com',
                'password':    'Short1!',
                're_password': 'Short1!',
            },
            'response': {
                'status_code': 400,
                'type':        'validation_error',
                'errors':      {'code': 'password_too_short', 'attr': 'password'},
            },
        },
        'invalid_password_numeric_only': {
            'params': {
                'email':       'test@test.com',
                'password':    '123456789012',
                're_password': '123456789012',
            },
            'response': {
                'status_code': 400,
                'type':        'validation_error',
                'errors':      {'code': 'password_entirely_numeric', 'attr': 'password'},
            },
        },
        'invalid_password_common': {
            'params': {
                'email':       'test@test.com',
                'password':    'password1234',
                're_password': 'password1234',
            },
            'response': {
                'status_code': 400,
                'type':        'validation_error',
                'errors':      {'code': 'password_too_common', 'attr': 'password'},
            },
        },
        'invalid_password_similar_to_email': {
            'params': {
                'email':       'user@example.com',
                'password':    'userexample12!',
                're_password': 'userexample12!',
            },
            'response': {
                'status_code': 400,
                'type':        'validation_error',
                'errors':      {'code': 'password_too_similar', 'attr': 'password'},
            },
        },
        'invalid_password_no_alphabet': {
            'params': {
                'email':       'test@test.com',
                'password':    '123456789012!',
                're_password': '123456789012!',
            },
            'response': {
                'status_code': 400,
                'type':        'validation_error',
                'errors':      {'code': 'invalid', 'attr': 'password'},
            },
        },
        'invalid_password_no_number': {
            'params': {
                'email':       'test@test.com',
                'password':    'OnlyLettersNoNum!',
                're_password': 'OnlyLettersNoNum!',
            },
            'response': {
                'status_code': 400,
                'type':        'validation_error',
                'errors':      {'code': 'invalid', 'attr': 'password'},
            },
        },
        'invalid_password_mismatch': {
            'params': {
                'email':       'test@test.com',
                'password':    'ValidPass123!',
                're_password': 'DifferentPass123!',
            },
            'response': {
                'status_code': 400,
                'type':        'validation_error',
                'errors':      {'code': 'password_mismatch', 'attr': 'non_field_errors'},
            },
        },
    }
    
    return data