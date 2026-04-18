import { TestBed } from '@angular/core/testing';
import { UiService } from './ui.service';

describe('UiService', () => {
  let service: UiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UiService]
    });
    service = TestBed.inject(UiService);
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  // searchQuery
  describe('searchQuery', () => {
    it('debería tener searchQuery vacío por defecto', done => {
      service.searchQuery.subscribe(query => {
        expect(query).toBe('');
        done();
      });
    });

    it('debería actualizar searchQuery con setSearchQuery', done => {
      service.setSearchQuery('hotel');
      service.searchQuery.subscribe(query => {
        expect(query).toBe('hotel');
        done();
      });
    });

    it('debería limpiar searchQuery con clearSearchQuery', done => {
      service.setSearchQuery('hotel');
      service.clearSearchQuery();
      service.searchQuery.subscribe(query => {
        expect(query).toBe('');
        done();
      });
    });

    it('debería emitir el valor actualizado a los suscriptores', () => {
      const values: string[] = [];
      service.searchQuery.subscribe(q => values.push(q));
      service.setSearchQuery('viaje');
      service.setSearchQuery('hotel');
      expect(values).toContain('viaje');
      expect(values).toContain('hotel');
    });

    it('debería mantener el último valor emitido', done => {
      service.setSearchQuery('primero');
      service.setSearchQuery('segundo');
      service.searchQuery.subscribe(query => {
        expect(query).toBe('segundo');
        done();
      });
    });

    it('debería aceptar cadena vacía', done => {
      service.setSearchQuery('');
      service.searchQuery.subscribe(query => {
        expect(query).toBe('');
        done();
      });
    });

    it('debería aceptar strings con espacios', done => {
      service.setSearchQuery('  viaje a tenerife  ');
      service.searchQuery.subscribe(query => {
        expect(query).toBe('  viaje a tenerife  ');
        done();
      });
    });
  });

  // activeTab
  describe('activeTab', () => {
    it('debería tener activeTab vacío por defecto', done => {
      service.activeTab.subscribe(tab => {
        expect(tab).toBe('');
        done();
      });
    });

    it('debería actualizar activeTab con setActiveTab', done => {
      service.setActiveTab('actividades');
      service.activeTab.subscribe(tab => {
        expect(tab).toBe('actividades');
        done();
      });
    });

    it('debería emitir el valor actualizado a los suscriptores', () => {
      const values: string[] = [];
      service.activeTab.subscribe(t => values.push(t));
      service.setActiveTab('gastos');
      service.setActiveTab('chat');
      expect(values).toContain('gastos');
      expect(values).toContain('chat');
    });

    it('debería aceptar cualquier string como tab', done => {
      service.setActiveTab('calendario');
      service.activeTab.subscribe(tab => {
        expect(tab).toBe('calendario');
        done();
      });
    });

    it('debería mantener el último tab emitido', done => {
      service.setActiveTab('actividades');
      service.setActiveTab('gastos');
      service.activeTab.subscribe(tab => {
        expect(tab).toBe('gastos');
        done();
      });
    });

    it('debería emitir los tabs en orden', () => {
      const tabs: string[] = [];
      service.activeTab.subscribe(t => tabs.push(t));
      service.setActiveTab('actividades');
      service.setActiveTab('calendario');
      service.setActiveTab('chat');
      expect(tabs[tabs.length - 1]).toBe('chat');
    });
  });

  // triggerProposeTravelModal
  describe('triggerProposeTravelModal', () => {
    it('debería emitir al llamar triggerProposeTravelModal', done => {
      service.openProposeTravelModal.subscribe(() => {
        expect(true).toBeTrue();
        done();
      });
      service.triggerProposeTravelModal();
    });

    it('debería emitir múltiples veces', () => {
      let count = 0;
      service.openProposeTravelModal.subscribe(() => count++);
      service.triggerProposeTravelModal();
      service.triggerProposeTravelModal();
      service.triggerProposeTravelModal();
      expect(count).toBe(3);
    });

    it('debería emitir void al suscribirse', done => {
      service.openProposeTravelModal.subscribe(value => {
        expect(value).toBeUndefined();
        done();
      });
      service.triggerProposeTravelModal();
    });
  });

  // clearSearchQuery
  describe('clearSearchQuery', () => {
    it('debería limpiar el searchQuery', done => {
      service.setSearchQuery('algo');
      service.clearSearchQuery();
      service.searchQuery.subscribe(query => {
        expect(query).toBe('');
        done();
      });
    });

    it('debería funcionar aunque el searchQuery ya estuviera vacío', done => {
      service.clearSearchQuery();
      service.searchQuery.subscribe(query => {
        expect(query).toBe('');
        done();
      });
    });
  });
});
