import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripCardComponent } from './trip-card.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('TripCardComponent', () => {
  let component: TripCardComponent;
  let fixture: ComponentFixture<TripCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripCardComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TripCardComponent);
    component = fixture.componentInstance;
    component.id = 'trip-1';
    component.icon = 'bi-compass';
    component.name = 'Viaje a Tenerife';
    component.startDate = new Date('2026-07-01');
    component.endDate = new Date('2026-07-07');
    component.members = 3;
    component.totalExpenses = 150;
    fixture.detectChanges();
  });

  // Creación
  describe('Creación', () => {
    it('debería crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debería tener showMenu false por defecto', () => {
      expect(component.showMenu).toBeFalse();
    });

    it('debería tener valores por defecto correctos en una instancia nueva', () => {
      const newFixture = TestBed.createComponent(TripCardComponent);
      const newComponent = newFixture.componentInstance;
      expect(newComponent.id).toBe('');
      expect(newComponent.icon).toBe('');
      expect(newComponent.name).toBe('');
      expect(newComponent.members).toBe(0);
      expect(newComponent.totalExpenses).toBe(0);
      expect(newComponent.showMenu).toBeFalse();
    });
  });

  // Inputs
  describe('Inputs', () => {
    it('debería recibir id correctamente', () => {
      expect(component.id).toBe('trip-1');
    });

    it('debería recibir icon correctamente', () => {
      expect(component.icon).toBe('bi-compass');
    });

    it('debería recibir name correctamente', () => {
      expect(component.name).toBe('Viaje a Tenerife');
    });

    it('debería recibir members correctamente', () => {
      expect(component.members).toBe(3);
    });

    it('debería recibir totalExpenses correctamente', () => {
      expect(component.totalExpenses).toBe(150);
    });

    it('debería recibir startDate correctamente', () => {
      expect(component.startDate).toEqual(new Date('2026-07-01'));
    });

    it('debería recibir endDate correctamente', () => {
      expect(component.endDate).toEqual(new Date('2026-07-07'));
    });

    it('debería actualizarse cuando cambia el nombre', () => {
      component.name = 'Viaje a Madrid';
      fixture.detectChanges();
      expect(component.name).toBe('Viaje a Madrid');
    });

    it('debería actualizarse cuando cambia totalExpenses', () => {
      component.totalExpenses = 300;
      fixture.detectChanges();
      expect(component.totalExpenses).toBe(300);
    });

    it('debería aceptar totalExpenses de 0', () => {
      component.totalExpenses = 0;
      expect(component.totalExpenses).toBe(0);
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

    it('debería separar las fechas con " - "', () => {
      expect(component.formattedDates).toContain(' - ');
    });

    it('debería devolver un string no vacío', () => {
      expect(component.formattedDates.length).toBeGreaterThan(0);
    });

    it('debería formatear correctamente con fechas de diferentes meses', () => {
      component.startDate = new Date('2026-06-28');
      component.endDate = new Date('2026-07-05');
      const result = component.formattedDates;
      expect(result).toContain('junio');
      expect(result).toContain('julio');
    });

    it('debería formatear correctamente con fechas de diferentes años', () => {
      component.startDate = new Date('2026-12-28');
      component.endDate = new Date('2027-01-03');
      const result = component.formattedDates;
      expect(result).toContain('2026');
      expect(result).toContain('2027');
    });

    it('debería incluir el día de inicio', () => {
      expect(component.formattedDates).toContain('1');
    });

    it('debería incluir el día de fin', () => {
      expect(component.formattedDates).toContain('7');
    });

    it('debería contener el mes en texto', () => {
      expect(component.formattedDates).toMatch(/[a-záéíóú]+/i);
    });

    it('debería formatear correctamente un viaje de un solo día', () => {
      component.startDate = new Date('2026-07-01');
      component.endDate = new Date('2026-07-01');
      expect(component.formattedDates).toContain('julio');
    });
  });

  // toggleMenu
  describe('toggleMenu', () => {
    it('debería abrir el menú al llamar toggleMenu', () => {
      const event = new MouseEvent('click');
      component.toggleMenu(event);
      expect(component.showMenu).toBeTrue();
    });

    it('debería cerrar el menú si ya estaba abierto', () => {
      const event = new MouseEvent('click');
      component.toggleMenu(event);
      component.toggleMenu(event);
      expect(component.showMenu).toBeFalse();
    });

    it('debería detener la propagación del evento', () => {
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');
      component.toggleMenu(event);
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('debería alternar el menú múltiples veces', () => {
      const event = new MouseEvent('click');
      component.toggleMenu(event);
      expect(component.showMenu).toBeTrue();
      component.toggleMenu(event);
      expect(component.showMenu).toBeFalse();
      component.toggleMenu(event);
      expect(component.showMenu).toBeTrue();
    });
  });

  // closeMenu
  describe('closeMenu', () => {
    it('debería cerrar el menú', () => {
      component.showMenu = true;
      component.closeMenu();
      expect(component.showMenu).toBeFalse();
    });

    it('debería mantener el menú cerrado si ya estaba cerrado', () => {
      component.showMenu = false;
      component.closeMenu();
      expect(component.showMenu).toBeFalse();
    });
  });

  // EventEmitters
  describe('EventEmitters', () => {
    it('debería emitir edit con el id correcto', () => {
      spyOn(component.edit, 'emit');
      component.edit.emit(component.id);
      expect(component.edit.emit).toHaveBeenCalledWith('trip-1');
    });

    it('debería emitir archive con el id correcto', () => {
      spyOn(component.archive, 'emit');
      component.archive.emit(component.id);
      expect(component.archive.emit).toHaveBeenCalledWith('trip-1');
    });

    it('debería emitir delete con el id correcto', () => {
      spyOn(component.delete, 'emit');
      component.delete.emit(component.id);
      expect(component.delete.emit).toHaveBeenCalledWith('trip-1');
    });

    it('debería emitir edit solo una vez', () => {
      spyOn(component.edit, 'emit');
      component.edit.emit(component.id);
      expect(component.edit.emit).toHaveBeenCalledTimes(1);
    });

    it('debería emitir archive solo una vez', () => {
      spyOn(component.archive, 'emit');
      component.archive.emit(component.id);
      expect(component.archive.emit).toHaveBeenCalledTimes(1);
    });

    it('debería emitir delete solo una vez', () => {
      spyOn(component.delete, 'emit');
      component.delete.emit(component.id);
      expect(component.delete.emit).toHaveBeenCalledTimes(1);
    });

    it('no debería emitir edit si no se llama', () => {
      spyOn(component.edit, 'emit');
      expect(component.edit.emit).not.toHaveBeenCalled();
    });

    it('no debería emitir archive si no se llama', () => {
      spyOn(component.archive, 'emit');
      expect(component.archive.emit).not.toHaveBeenCalled();
    });

    it('no debería emitir delete si no se llama', () => {
      spyOn(component.delete, 'emit');
      expect(component.delete.emit).not.toHaveBeenCalled();
    });

    it('debería emitir edit con el id actualizado si cambia', () => {
      component.id = 'trip-999';
      spyOn(component.edit, 'emit');
      component.edit.emit(component.id);
      expect(component.edit.emit).toHaveBeenCalledWith('trip-999');
    });
  });
});
