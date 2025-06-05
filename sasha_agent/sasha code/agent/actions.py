def decide_action(state):
    if "delete" in state.get("text", "").lower():
        return "unsafe"
    return "safe"

def execute_action(state):
    print("Executing safe action:", state)
    return state

def escalate_to_king(state):
    print("Escalating to King:", state)
    return state
