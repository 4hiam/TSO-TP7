"""
==============================================================================
UNJu - Universidad Nacional de Jujuy | Facultad de Ingeniería
Cátedra: Teoría de Sistemas Operativos (TSO) - Ciclo Lectivo 2026
Titular: Ing. María Fernanda Vázquez - JTP: Ing. Fabio D. Argañaraz
------------------------------------------------------------------------------
SISTEMA DE AUTOEVALUACIÓN AUTOMATIZADA - TP N° 7: MEMORIA VIRTUAL
Evaluación de Laboratorio Interactivo y Ejercicios Conceptuales (Rúbrica SHA-256)
==============================================================================
"""

import sys
import json
import hashlib
import os

# Fuerza codificación UTF-8 en consola Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

CATEDRA_SALT = "TSO_UNJu_FI_2026_CatedraVazquez_SecretSalt"


def get_hash(ej_id, item_id, val):
    s = f"{ej_id}:{item_id}:{val}:{CATEDRA_SALT}"
    return hashlib.sha256(s.encode('utf-8')).hexdigest()


def evaluar_teoria(archivo_respuestas="respuestas_tp7.json"):
    """Evalúa el archivo JSON generado en index.html contra rubric_tp7.json."""
    if not os.path.exists(archivo_respuestas):
        return {
            "disponible": False,
            "error": f"No se encontró el archivo '{archivo_respuestas}'.",
            "score": 0,
            "max_score": 100,
            "grade": 0.0,
            "results": []
        }

    try:
        with open(archivo_respuestas, 'r', encoding='utf-8') as f:
            respuestas = json.load(f)
    except Exception as e:
        return {
            "disponible": False,
            "error": f"Error al leer '{archivo_respuestas}': {e}",
            "score": 0,
            "max_score": 100,
            "grade": 0.0,
            "results": []
        }

    rubric_file = 'rubric_tp7.json'
    if not os.path.exists(rubric_file):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        rubric_file = os.path.join(base_dir, 'rubric_tp7.json')

    if not os.path.exists(rubric_file):
        return {
            "disponible": False,
            "error": "No se encontró 'rubric_tp7.json'.",
            "score": 0,
            "max_score": 100,
            "grade": 0.0,
            "results": []
        }

    with open(rubric_file, 'r', encoding='utf-8') as f:
        rubrica = json.load(f)

    max_score = rubrica.get("max_score", 100)
    exercises = rubrica.get("exercises", {})

    total_score = 0
    results = []

    for ej_id, ej_data in exercises.items():
        weight = ej_data.get("weight", 0)
        expected_hash = ej_data.get("hash")
        
        # Soporte para alias retrocompatible de ej7
        student_ans = respuestas.get(ej_id, "")
        if not student_ans and ej_id == "ej7_reemplazo_local_global":
            student_ans = respuestas.get("ej7_asignacion_marcos", "")

        if not student_ans:
            results.append({"ej_id": ej_id, "status": "Sin responder", "score": 0, "feedback": "Consigna no respondida en index.html."})
            continue

        student_hash = get_hash(ej_id, 'q1', student_ans)

        if student_hash == expected_hash:
            total_score += weight
            results.append({"ej_id": ej_id, "status": "Correcto", "score": weight, "feedback": "¡Excelente!"})
        else:
            results.append({"ej_id": ej_id, "status": "Incorrecto", "score": 0, "feedback": ej_data.get("feedback", "Revisar bibliografía.")})

    nota = (total_score / max_score) * 10
    return {
        "disponible": True,
        "score": total_score,
        "max_score": max_score,
        "grade": nota,
        "results": results
    }


def imprimir_reporte(reporte):
    print("\n" + "=" * 78)
    print("   UNIVERSIDAD NACIONAL DE JUJUY - FACULTAD DE INGENIERÍA")
    print("   CÁTEDRA: TEORÍA DE SISTEMAS OPERATIVOS (TSO) - CICLO LECTIVO 2026")
    print("   REPORTE OFICIAL DE AUTOEVALUACIÓN: TP N° 7 (MEMORIA VIRTUAL)")
    print("=" * 78)

    if not reporte["disponible"]:
        print(f"\n⚠️  {reporte['error']}")
        print("   Puntaje: 0/100 (Nota: 0.0/10.0)")
        print("   -> Instrucciones: Abre 'index.html', experimenta con los simuladores,")
        print("      completa los ejercicios, descarga 'respuestas_tp7.json' y colócalo en")
        print("      la raíz del repositorio antes de ejecutar este script.\n")
        sys.exit(1)

    print(f"\n[ RESULTADOS DE LA EVALUACIÓN INTERACTIVA Y CONCEPTUAL ({len(reporte['results'])} EJERCICIOS) ]")
    print("-" * 78)
    for r in reporte["results"]:
        if r["status"] == "Correcto":
            icon = "✅"
        elif r["status"] == "Sin responder":
            icon = "⚠️"
        else:
            icon = "❌"
        print(f"  {icon} {r['ej_id']:<32} Puntos: {r['score']:>2} | {r['feedback']}")
    print("-" * 78)
    print(f"  PUNTAJE TOTAL: {reporte['score']}/{reporte['max_score']} pts")
    print(f"  NOTA FINAL:    {reporte['grade']:.1f} / 10.0")

    estado = "APROBADO" if reporte["grade"] >= 6.0 else "DESAPROBADO / REQUIERE REVISIÓN"
    print(f"  ESTADO:        [{estado}]")
    print("=" * 78 + "\n")

    if reporte["grade"] < 6.0:
        sys.exit(1)


if __name__ == '__main__':
    archivo = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else "respuestas_tp7.json"
    rep = evaluar_teoria(archivo)
    imprimir_reporte(rep)
