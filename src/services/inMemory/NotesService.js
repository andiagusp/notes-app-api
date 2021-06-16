const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class NotesService {
  constructor() {
    this._notes = [];
  }

  addNote({ title, tags, body }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const newNote = {
      title, tags, body, id, createdAt, updatedAt,
    };

    this._notes.push(newNote);

    const isSuccess = this._notes.filter((note) => note.id === id).length > 0;

    if (!isSuccess) {
      throw new InvariantError('Catatan gagal ditambahkan');
    }

    return id;
  }

  getNotes() {
    console.log(this._notes)
    return this._notes;
  }

  getNoteById(id) {
    const note = this._notes.filter(note => note.id === id)[0];
    if (!note) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }
    return note;
  }

  editNoteById(id, { body, tags, title }) {
    const index = this._notes.findIndex(note => note.id === id);
    console.log(this._notes)
    console.log(index)
    if (index === -1) {
      throw new NotFoundError('Gagal memperbarui catatan, data tidak ditemukan');
    }
    const updatedAt = new Date().toISOString();
    this._notes[index] = {
      ...this._notes[index], title, tags, body, updatedAt
    };
  }

  deleteNoteById(id) {
    const index = this._notes.findIndex(note => note.id === id);
    if (index === -1) {
      throw new NotFoundError('Gagal menghapus catatan, data tidak ditemukan');
    }
    this._notes.splice(index, 1);
  }
}

module.exports = NotesService;
