
def get_bearer_token(header_val: str | None) -> str | None:
    if not header_val or len(header_val.split(" ")) < 2:
        return None
    token = header_val.split(" ")[1]
    return token
