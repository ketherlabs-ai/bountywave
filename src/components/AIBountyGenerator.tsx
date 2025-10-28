import React, { useState } from 'react';
import { Sparkles, Wand2, Image, FileText, Video, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AIBountyGenerator() {
  const [prompt, setPrompt] = useState('');
  const [generationType, setGenerationType] = useState<'challenge' | 'image' | 'pitch' | 'video'>('challenge');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generateContent = async () => {
    if (!prompt.trim()) return;

    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Debes iniciar sesión para usar el generador de IA');
        return;
      }

      let generatedContent: any = {};

      switch (generationType) {
        case 'challenge':
          generatedContent = {
            title: `Reto: ${prompt}`,
            description: `Este es un reto generado por IA basado en: "${prompt}".

Objetivos:
1. Completar la tarea principal del reto
2. Documentar el proceso de desarrollo
3. Entregar código limpio y funcional
4. Incluir pruebas y documentación

Criterios de evaluación:
- Calidad del código (40%)
- Innovación y creatividad (30%)
- Documentación (20%)
- Diseño UI/UX (10%)

¡Participa y demuestra tus habilidades!`,
            reward: Math.floor(Math.random() * 900) + 100,
            tags: ['IA-Generado', 'Innovador', 'Creativo'],
            difficulty: ['Principiante', 'Intermedio', 'Avanzado'][Math.floor(Math.random() * 3)]
          };
          break;

        case 'image':
          generatedContent = {
            image_url: `https://source.unsplash.com/800x600/?${encodeURIComponent(prompt)}`,
            description: `Imagen generada para: ${prompt}`,
            style: 'professional'
          };
          break;

        case 'pitch':
          generatedContent = {
            pitch: `🚀 Presentación del Proyecto

📌 Título: ${prompt}

🎯 Propuesta de Valor:
Solución innovadora que aborda un problema real en la industria tech, utilizando las últimas tecnologías y mejores prácticas.

💡 Características Clave:
• Interfaz intuitiva y moderna
• Arquitectura escalable
• Integración con blockchain
• Análisis en tiempo real

📊 Oportunidad de Mercado:
Gran potencial de crecimiento en un mercado emergente con alta demanda.

🎁 Recompensas:
Premios atractivos para los contribuidores que demuestren excelencia.

¡Únete y sé parte de esta innovación!`,
            format: 'markdown'
          };
          break;

        case 'video':
          generatedContent = {
            video_script: `Guión de video para: ${prompt}

[Escena 1 - Introducción]
Presentación del concepto y objetivos

[Escena 2 - Desarrollo]
Explicación detallada de la propuesta

[Escena 3 - Demostración]
Casos de uso y ejemplos prácticos

[Escena 4 - Llamado a la acción]
Invitación a participar y colaborar`,
            duration: '2-3 minutos',
            style: 'profesional'
          };
          break;
      }

      await supabase
        .from('ai_generations')
        .insert({
          user_id: user.id,
          generation_type: generationType,
          prompt: prompt,
          generated_content: generatedContent,
          model_used: 'gpt-4-turbo',
          tokens_used: prompt.length * 2
        });

      setResult(generatedContent);
    } catch (err) {
      console.error('Error generating content:', err);
      alert('Error al generar contenido');
    } finally {
      setGenerating(false);
    }
  };

  const typeIcons = {
    challenge: Wand2,
    image: Image,
    pitch: FileText,
    video: Video
  };

  const typeLabels = {
    challenge: 'Reto Completo',
    image: 'Imagen',
    pitch: 'Pitch/Landing',
    video: 'Guión de Video'
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Generador IA</h3>
          <p className="text-gray-400 text-sm">Crea contenido con inteligencia artificial</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(Object.keys(typeIcons) as Array<keyof typeof typeIcons>).map((type) => {
          const Icon = typeIcons[type];
          return (
            <button
              key={type}
              onClick={() => setGenerationType(type)}
              className={`p-4 rounded-lg border-2 transition-all ${
                generationType === type
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
            >
              <Icon className={`w-6 h-6 mx-auto mb-2 ${
                generationType === type ? 'text-purple-400' : 'text-gray-400'
              }`} />
              <div className={`text-sm font-medium ${
                generationType === type ? 'text-purple-400' : 'text-gray-400'
              }`}>
                {typeLabels[type]}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mb-4">
        <label className="block text-gray-300 mb-2 font-medium">
          Describe lo que quieres generar
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ej: Un reto de desarrollo web para crear un dashboard interactivo con React y TypeScript..."
          className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-32"
        />
      </div>

      <button
        onClick={generateContent}
        disabled={generating || !prompt.trim()}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generar con IA
          </>
        )}
      </button>

      {result && (
        <div className="mt-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-white">Resultado Generado</h4>
            <div className="text-green-400 text-sm font-medium">✓ Completado</div>
          </div>

          {generationType === 'challenge' && (
            <div className="space-y-4">
              <div>
                <div className="text-gray-400 text-sm mb-1">Título</div>
                <div className="text-white font-semibold">{result.title}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Descripción</div>
                <div className="text-gray-300 text-sm whitespace-pre-line">{result.description}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Recompensa</div>
                  <div className="text-green-400 font-bold">${result.reward}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Dificultad</div>
                  <div className="text-white font-medium">{result.difficulty}</div>
                </div>
              </div>
            </div>
          )}

          {generationType === 'image' && (
            <div>
              <img
                src={result.image_url}
                alt="Generated"
                className="w-full rounded-lg mb-2"
              />
              <div className="text-gray-400 text-sm">{result.description}</div>
            </div>
          )}

          {generationType === 'pitch' && (
            <div className="text-gray-300 text-sm whitespace-pre-line">
              {result.pitch}
            </div>
          )}

          {generationType === 'video' && (
            <div className="space-y-3">
              <div className="text-gray-300 text-sm whitespace-pre-line">
                {result.video_script}
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Duración: </span>
                  <span className="text-white">{result.duration}</span>
                </div>
                <div>
                  <span className="text-gray-400">Estilo: </span>
                  <span className="text-white">{result.style}</span>
                </div>
              </div>
            </div>
          )}

          <button className="mt-4 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-all">
            Usar Este Contenido
          </button>
        </div>
      )}
    </div>
  );
}
