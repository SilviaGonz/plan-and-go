import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DayItinerary } from '../../models/travel';
import { ItineraryBuilderComponent } from '../itinerary-builder/itinerary-builder.component';
import { environment } from '../../../environments/environment';

export interface AiItineraryConfig {
  activities: string[];
  priority: 'minimize-distance' | 'minimize-time';
  pace: 'relaxed' | 'moderate' | 'intense';
}

@Component({
  selector: 'app-itinerary-ia-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, ItineraryBuilderComponent],
  templateUrl: './itinerary-ia-builder.component.html',
  styleUrl: './itinerary-ia-builder.component.css'
})
export class ItineraryIaBuilderComponent {
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @Output() itineraryGenerated = new EventEmitter<DayItinerary[]>();

  activities: string[] = ['', ''];
  priority: 'minimize-distance' | 'minimize-time' = 'minimize-distance';
  pace: 'relaxed' | 'moderate' | 'intense' = 'moderate';

  generating = false;
  generated = false;
  generatedItinerary: DayItinerary[] = [];

  loadingSteps = [
    { label: 'Analizando ubicaciones...', done: false },
    { label: 'Calculando distancias...', done: false },
    { label: 'Optimizando rutas...', done: false },
    { label: 'Organizando por días...', done: false },
  ];

  stats = { activities: 0, timeSaved: 0, distance: 0 };

  addActivity(): void {
    this.activities.push('');
  }

  removeActivity(index: number): void {
    this.activities.splice(index, 1);
  }

  updateActivity(index: number, value: string): void {
    this.activities[index] = value;
  }

  trackByIndex(index: number): number {
    return index;
  }

  get filledActivities(): string[] {
    return this.activities.filter(a => a.trim() !== '');
  }

  get dayCount(): number {
    if (!this.startDate || !this.endDate) return 0;
    const diff = new Date(this.endDate).getTime() - new Date(this.startDate).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  async generate(): Promise<void> {
    if (this.filledActivities.length === 0) return;

    this.generating = true;
    this.loadingSteps.forEach(s => s.done = false);

    for (let i = 0; i < this.loadingSteps.length - 1; i++) {
      await this.delay(900);
      this.loadingSteps[i].done = true;
    }

    try {
      const itinerary = await this.callGroqApi();
      this.loadingSteps[3].done = true;
      await this.delay(500);

      this.generatedItinerary = itinerary;
      this.stats.activities = this.filledActivities.length;
      this.stats.timeSaved = Math.floor(Math.random() * 30) + 10;
      this.stats.distance = Math.floor(Math.random() * 50) + 10;

      this.generating = false;
      this.generated = true;
      this.itineraryGenerated.emit(itinerary);

    } catch (error) {
      this.generating = false;
      console.error('Error generando itinerario:', error);
    }
  }

  private async callGroqApi(): Promise<DayItinerary[]> {
    const priorityLabel = this.priority === 'minimize-distance' ? 'minimizar distancias' : 'minimizar tiempo';
    const paceLabel = { relaxed: 'relajado', moderate: 'moderado', intense: 'intenso' }[this.pace];

    const prompt = `Eres un experto en planificación de viajes.
Tengo un viaje del ${this.startDate} al ${this.endDate} (${this.dayCount} días).
Actividades que quiero hacer: ${this.filledActivities.join(', ')}.
Preferencia de optimización: ${priorityLabel}.
Ritmo del viaje: ${paceLabel}.

Organiza estas actividades por días de forma óptima y devuelve SOLO un JSON válido con esta estructura exacta, sin texto adicional ni backticks:
[
  {
    "date": "YYYY-MM-DD",
    "label": "Lunes, 7 de julio de 2026",
    "activities": [
      { "name": "nombre actividad", "time": "HH:MM" }
    ]
  }
]
Las fechas deben estar entre ${this.startDate} y ${this.endDate}. Asigna horas realistas según el ritmo ${paceLabel}.`;

    const response = await fetch('/groq-api/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${environment.groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    const data = await response.json();
    console.log('respuesta Groq:', JSON.stringify(data));

    const text = data.choices[0].message.content.trim();
    const clean = text
      .replace(/```json|```/g, '')
      .replace(/[\n\r\t]/g, ' ')
      .trim();
    const parsed = JSON.parse(clean);

    return parsed.map((day: any) => ({
  date: new Date(day.date + 'T00:00:00'),
  label: day.label,
  activities: day.activities.map((act: any) => ({
    name: act.name,
    time: act.time?.split('-')[0]?.trim() || '00:00'
  }))
}));
  }

  resetToForm(): void {
    this.generated = false;
    this.generating = false;
    this.generatedItinerary = [];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
