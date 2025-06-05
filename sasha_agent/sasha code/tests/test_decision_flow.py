from agent.decision_graph import build_graph

def test_safe_path():
    graph = build_graph()
    result = graph.invoke({"input": "Hello Sasha, tell me a joke."})
    assert "text" in result
