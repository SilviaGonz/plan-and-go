import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastNotificationComponent } from './toast-notification.component';

describe('ToastNotificationComponent', () => {
  let component: ToastNotificationComponent;
  let fixture: ComponentFixture<ToastNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastNotificationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Creación
  describe('Creación', () => {
    it('debería crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debería tener valores por defecto correctos', () => {
      expect(component.message).toBe('');
      expect(component.submessage).toBe('');
      expect(component.icon).toBe('bi-trash');
      expect(component.type).toBe('error');
    });
  });

  // Inputs
  describe('Inputs', () => {
    it('debería recibir message correctamente', () => {
      component.message = 'Viaje eliminado';
      fixture.detectChanges();
      expect(component.message).toBe('Viaje eliminado');
    });

    it('debería recibir submessage correctamente', () => {
      component.submessage = 'Esta acción no se puede deshacer';
      fixture.detectChanges();
      expect(component.submessage).toBe('Esta acción no se puede deshacer');
    });

    it('debería recibir icon correctamente', () => {
      component.icon = 'bi-check2-square';
      fixture.detectChanges();
      expect(component.icon).toBe('bi-check2-square');
    });

    it('debería recibir type error correctamente', () => {
      component.type = 'error';
      fixture.detectChanges();
      expect(component.type).toBe('error');
    });

    it('debería recibir type success correctamente', () => {
      component.type = 'success';
      fixture.detectChanges();
      expect(component.type).toBe('success');
    });

    it('debería recibir type warning correctamente', () => {
      component.type = 'warning';
      fixture.detectChanges();
      expect(component.type).toBe('warning');
    });

    it('debería actualizarse cuando cambia el message', () => {
      component.message = 'Mensaje inicial';
      fixture.detectChanges();
      expect(component.message).toBe('Mensaje inicial');
      component.message = 'Mensaje actualizado';
      fixture.detectChanges();
      expect(component.message).toBe('Mensaje actualizado');
    });

    it('debería aceptar message con caracteres especiales', () => {
      component.message = '¡Viaje archivado correctamente!';
      fixture.detectChanges();
      expect(component.message).toBe('¡Viaje archivado correctamente!');
    });

    it('debería aceptar message vacío', () => {
      component.message = '';
      fixture.detectChanges();
      expect(component.message).toBe('');
    });

    it('debería aceptar submessage vacío', () => {
      component.submessage = '';
      fixture.detectChanges();
      expect(component.submessage).toBe('');
    });
  });

  // Auto-cierre
  describe('Auto-cierre', () => {
    it('debería emitir closed después de 4000ms', fakeAsync(() => {
      spyOn(component.closed, 'emit');
      component.ngOnInit();
      tick(4000);
      expect(component.closed.emit).toHaveBeenCalled();
    }));

    it('no debería emitir closed antes de 4000ms', fakeAsync(() => {
      spyOn(component.closed, 'emit');
      component.ngOnInit();
      tick(3999);
      expect(component.closed.emit).not.toHaveBeenCalled();
      tick(1);
    }));

    it('debería emitir closed exactamente una vez', fakeAsync(() => {
      spyOn(component.closed, 'emit');
      component.ngOnInit();
      tick(4000);
      expect(component.closed.emit).toHaveBeenCalledTimes(1);
    }));

    it('no debería emitir closed a los 2000ms', fakeAsync(() => {
      spyOn(component.closed, 'emit');
      component.ngOnInit();
      tick(2000);
      expect(component.closed.emit).not.toHaveBeenCalled();
      tick(2000);
    }));
  });

  // EventEmitter
  describe('EventEmitter closed', () => {
    it('debería poder emitir closed manualmente', () => {
      spyOn(component.closed, 'emit');
      component.closed.emit();
      expect(component.closed.emit).toHaveBeenCalled();
    });

    it('debería emitir closed sin argumentos', fakeAsync(() => {
      spyOn(component.closed, 'emit');
      component.ngOnInit();
      tick(4000);
      expect(component.closed.emit).toHaveBeenCalledWith();
    }));
  });
});
