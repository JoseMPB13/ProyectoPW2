from flask import Blueprint, request, jsonify

# ==============================================================================
# ENCABEZADO DEL ARCHIVO (Controlador - Servicios AI)
# ==============================================================================
# Propósito:
#   Interfaz para capacidades de Inteligencia Artificial Generativa.
#   Actualmente implementa Stubs/Mocks para desarrollo, listo para integración
#   con LangChain o proveedores LLM (OpenAI, Gemini).
#
# Flujo Lógico Central:
#   1. Recepción de Prompt/Pregunta.
#   2. (Futuro) RAG: Recuperación de contexto.
#   3. (Futuro) Generación: Paso a LLM.
#   4. Respuesta estructurada.
#
# Interacciones:
#   - Cliente: Chatbot del Frontend.
# ==============================================================================

ai_bp = Blueprint('ai', __name__, url_prefix='/ai')

# ==============================================================================
# Endpoint: Consulta a la IA
# ==============================================================================
@ai_bp.route('/ask', methods=['POST'])
def ask_ai():
    """
    Procesa una consulta del usuario y devuelve una respuesta generada.
    
    Request Body:
        question (str): El texto de la pregunta.
        context (str, opcional): Historial o contexto adicional.
        
    Returns:
        JSON: { response: "texto", ... }
    """
    data = request.get_json()
    
    # Validación Básica
    if not data or not data.get('question'):
        return jsonify({"msg": "Se requiere una pregunta (field: question)"}), 400

    question = data['question']
    # contexto = data.get('context', '') 

    # TODO: Integración Real
    # Aquí iría la llamada a LangChain o API de OpenAI.
    # Por ahora devolvemos un eco inteligente.
    
    mock_response = f"Simulación de IA: He recibido tu pregunta sobre '{question}'. El sistema de RAG estará disponible próximamente."

    return jsonify({
        "response": mock_response,
        "question_received": question
    }), 200
