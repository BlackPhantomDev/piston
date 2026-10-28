/*
 * PiSton - A tiny web panel for your Minecraft server on a Raspberry Pi
 * Copyright (C) 2026 Mischa S.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * Additional terms apply under Section 7 of the license;
 * see the ADDITIONAL_TERMS file in the root of this repository.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/** German UI strings. */
export default {
  nav: {
    label: 'Hauptnavigation',
    menu: 'Menü',
    home: 'Home',
    console: 'Konsole',
    settings: 'Einstellungen',
  },
  sidebar: {
    address: 'Adresse',
  },
  lang: {
    label: 'Sprache',
    planned: 'geplant',
  },
  page: {
    placeholder: 'Inhalt folgt.',
  },
  home: {
    players: 'Spieler online',
    tps: 'TPS',
    tpsDesc: 'Ziel 20',
    playerList: 'Spieler',
    quickactions: 'Schnellaktionen',
    ram: 'Arbeitsspeicher',
    console: "Letzte Konsolenausgabe",
    consoleLink: "Zur Konsole",
    serverMonitoring: 'Server-Monitoring',
    systemMonitoring: 'System-Monitoring',
    quick: {
      save: 'Welt speichern',
      backup: 'Backup erstellen',
      say: 'Nachricht an alle',
      day: 'Tag setzen',
      lastBackup: 'Letztes: {when}',
      noBackup: 'Noch kein Backup',
      backupRunning: 'Backup läuft …',
    },
    sayDialog: {
      title: 'Nachricht an alle',
      label: 'Nachricht',
      help: 'Erscheint im Chat als [Server].',
      send: 'Senden',
    },
  },
  server: {
    start: 'Starten',
    stop: 'Stoppen',
    restart: 'Neu starten',
    runningFor: 'läuft seit {duration}',
  },
  when: {
    today: 'heute {time}',
    yesterday: 'gestern {time}',
    date: '{date} {time}',
  },
  common: {
    cancel: 'Abbrechen',
  },
  duration: {
    lessThanMinute: '< 1 min',
    minutes: '{m} min',
    hours: '{h} h {m} min',
    days: '{d} d {h} h',
  },
  status: {
    online: 'Online',
    offline: 'Offline',
    starting: 'Startet …',
    stopping: 'Stoppt …',
  },
  stepper: {
    decrease: 'Weniger',
    increase: 'Mehr',
  },
};
