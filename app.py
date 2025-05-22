from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

articulos_db = [
    {"id": 1, "titulo": "Papas sol"},
    {"id": 2, "titulo": "Teclado mecánico"},
    {"id": 3, "titulo": "Bolsa totis surtidos"}
]

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/articulos')
def articulos():
    return jsonify(articulos_db)

@app.route('/api/AgregarArticulos', methods=['POST'])
def agregar_articulo():
    articulo = request.get_json()

    #Asignar un nuevo ID al artículo
    nuevo_id = 1
    if articulos_db:
        nuevo_id = max(item["id"] for item in articulos_db) + 1

    articulo["id"] = nuevo_id

    #Guardamos el articulo en la "base de datos"
    articulos_db.append(articulo)

    print(f"Artículo agregado: {articulo}")
    print(f"Total de artículos: {len(articulos_db)}")

    return jsonify({"status": "ok", "id": nuevo_id}), 201


if __name__ == '__main__':
    app.run(debug=True)
