import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteTravelModalComponent } from './delete-travel-modal.component';
import { Travel } from '../../models/travel';

const mockTravel: Travel = {
  id: '1',
  icon: 'bi-compass',
  name: 'Viaje a Tenerife',
  description: 'Un viaje de prueba',
  startDate: new Date('2026-07-01'),
  endDate: new Date('2026-07-07'),
  itineraryType: 'manual',
  membersCount: 3,
  members: [],
  images: [],
  notes: '',
  createdBy: 'user-1',
  createdAt: new Date(),
};

describe('DeleteTravelModalComponent', () => {
  let component: DeleteTravelModalComponent;
  let fixture: ComponentFixture<DeleteTravelModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteTravelModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteTravelModalComponent);
    component = fixture.componentInstance;
    component.travel = mockTravel;
    fixture.detectChanges();
  });

  // Creación
  describe('Creación', () => {
    it('debería crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debería recibir el viaje correctamente', () => {
      expect(component.travel).toEqual(mockTravel);
    });

    it('debería tener el nombre del viaje correcto', () => {
      expect(component.travel.name).toBe('Viaje a Tenerife');
    });

    it('debería tener el número de miembros correcto', () => {
      expect(component.travel.membersCount).toBe(3);
    });

    it('debería tener el icono correcto', () => {
      expect(component.travel.icon).toBe('bi-compass');
    });
  });

  // formattedDates
  describe('formattedDates', () => {
    it('debería formatear las fechas correctamente en español', () => {
      const result = component.formattedDates;
      expect(result).toContain('julio');
      expect(result).toContain('2026');
      expect(result).toContain('-');
    });

    it('debería incluir la fecha de inicio', () => {
      expect(component.formattedDates).toContain('1');
    });

    it('debería incluir la fecha de fin', () => {
      expect(component.formattedDates).toContain('7');
    });

    it('debería separar las fechas con " - "', () => {
      expect(component.formattedDates).toContain(' - ');
    });

    it('debería devolver un string no vacío', () => {
      expect(component.formattedDates.length).toBeGreaterThan(0);
    });

    it('debería formatear correctamente con fechas de diferentes meses', () => {
      component.travel = { ...mockTravel, startDate: new Date('2026-06-28'), endDate: new Date('2026-07-05') };
      const result = component.formattedDates;
      expect(result).toContain('junio');
      expect(result).toContain('julio');
    });

    it('debería formatear correctamente con fechas de diferentes años', () => {
      component.travel = { ...mockTravel, startDate: new Date('2026-12-28'), endDate: new Date('2027-01-03') };
      const result = component.formattedDates;
      expect(result).toContain('2026');
      expect(result).toContain('2027');
    });

    it('debería contener el mes en texto', () => {
      const result = component.formattedDates;
      expect(result).toMatch(/[a-záéíóú]+/i);
    });

    it('debería formatear correctamente un viaje de un solo día', () => {
      component.travel = { ...mockTravel, startDate: new Date('2026-07-01'), endDate: new Date('2026-07-01') };
      expect(component.formattedDates).toContain('julio');
    });
  });

  // EventEmitters
  describe('EventEmitters', () => {
    it('debería emitir cancel al cancelar', () => {
      spyOn(component.cancel, 'emit');
      component.cancel.emit();
      expect(component.cancel.emit).toHaveBeenCalled();
    });

    it('debería emitir confirm al confirmar', () => {
      spyOn(component.confirm, 'emit');
      component.confirm.emit();
      expect(component.confirm.emit).toHaveBeenCalled();
    });

    it('debería emitir cancel solo una vez', () => {
      spyOn(component.cancel, 'emit');
      component.cancel.emit();
      expect(component.cancel.emit).toHaveBeenCalledTimes(1);
    });

    it('debería emitir confirm solo una vez', () => {
      spyOn(component.confirm, 'emit');
      component.confirm.emit();
      expect(component.confirm.emit).toHaveBeenCalledTimes(1);
    });

    it('no debería emitir cancel si no se llama', () => {
      spyOn(component.cancel, 'emit');
      expect(component.cancel.emit).not.toHaveBeenCalled();
    });

    it('no debería emitir confirm si no se llama', () => {
      spyOn(component.confirm, 'emit');
      expect(component.confirm.emit).not.toHaveBeenCalled();
    });

    it('debería poder emitir cancel múltiples veces', () => {
      spyOn(component.cancel, 'emit');
      component.cancel.emit();
      component.cancel.emit();
      expect(component.cancel.emit).toHaveBeenCalledTimes(2);
    });

    it('debería poder emitir confirm múltiples veces', () => {
      spyOn(component.confirm, 'emit');
      component.confirm.emit();
      component.confirm.emit();
      expect(component.confirm.emit).toHaveBeenCalledTimes(2);
    });
  });
});
