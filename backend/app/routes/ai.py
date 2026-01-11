from flask import Blueprint, request, jsonify

# ==============================================================================
# Capa de RUTAS (Controlador) - Inteligencia Artificial
# ==============================================================================
# Endpoints para la comunicación con modelos de IA (Mock / Stub actualmente).
# Futura integración con LangChain / OpenAI.
# ==============================================================================

ai_bp = Blueprint('ai', __name__, url_prefix='/ai')

# ==============================================================================
# Endpoint: Preguntar a la IA (Mock)
# ==============================================================================
@ai_bp.route('/ask', methods=['POST'])
def ask_ai():
    """
    Recibe una pregunta y devuelve una respuesta simulada (Stub).
    Diseñado para integrar posteriormente lógica de RAG o LLMs.

    Request Body:
        question (str): Pregunta del usuario.
        context (str, optional): Contexto adicional.

    Returns:
        JSON: Respuesta generada por la IA (o Mock).
    """
    data = request.get_json()
    
    # Validar entrada
    if not data or not data.get('question'):
        return jsonify({"msg": "Se requiere una pregunta (field: question)"}), 400

    question = data['question']
    context = data.get('context', '') # Contexto opcional (ej: historial de chat)

    # TODO: Implementar LangChain aquí
    # Aquí es donde conectaríamos con OpenAI/Anthropic/Gemini usando LangChain.
    # Podríamos usar el 'context' para RAG (Retrieval Augmented Generation).

    # Respuesta simulada por ahora
    mock_response = f"El backend recibió tu pregunta sobre: {question}"

    return jsonify({
        "response": mock_response,
        "question_received": question
    }), 200
