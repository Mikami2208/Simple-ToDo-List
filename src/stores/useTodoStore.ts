import { create, type StateCreator } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type Filter = "all" | "completed" | "done";
type MiddlewareStack = [
  ["zustand/immer", never],
  ["zustand/devtools", never],
  ["zustand/persist", unknown]
];

interface ITodo {
  id: string;
  text: string;
  completed: boolean;
  isEditing: boolean;
}

interface IActions {
  addTodo: (text: string) => void;
  setIsEditing: (id: string, editingState: boolean) => void;
  editTodo: (id: string, text: string) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  setFilter: (f: Filter) => void;
}

interface IInitialState {
  todos: ITodo[];
  filter: Filter;
}

interface ITodoState extends IInitialState, IActions {}

const initialState: IInitialState = {
  todos: [],
  filter: "all",
};

const todoStore: StateCreator<ITodoState, MiddlewareStack> = (set) => ({
  ...initialState,
  addTodo: (text: string) => {
    set(
      (state) => {
        state.todos.push({id: uuidv4(), text: text, completed: false, idEditing: false})
      },
      false,
      "addTodo"
    );
  },

  setIsEditing: (id: string) => {
    set(
      (state) => {
        const todo = state.todos.find((todo: ITodo) => todo.id === id);
        if (todo) {
          todo.isEditing = true;
        }
      },
      false,
      "setIsEditingState"
    );
  },

  editTodo: (id: string, text: string) => {
    set(
      (state) => {
        const todo = state.todos.find((todo: ITodo) => todo.id === id);
        if (todo) {
          todo.text = text;
          todo.isEditing = false
        }
      },
      false,
      "editTodo"
    );
  },

  deleteTodo: (id: string) => {
    set(
      (state) => {
        const todoIndex = state.todos.findIndex(
          (todo: ITodo) => todo.id === id
        );
        if (todoIndex !== -1) {
          state.todos.splice(todoIndex, 1);
        }
      },
      false,
      "deleteTodo"
    );
  },

  toggleTodo: (id: string) => {
    set(
      (state) => {
        const todo = state.todos.find((todo: ITodo) => todo.id === id);
        if (todo) {
          todo.completed = !todo.completed;
        }
      },
      false,
      "toggleTodo"
    );
  },

  setFilter: (f: Filter) => {
    set(
      () => ({
        filter: f,
      }),
      false,
      "setFilter"
    );
  },
});

const useTodoStore = create<ITodoState>()(
  immer(
    devtools(
      persist(todoStore, {
        name: "todo-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ todos: state.todos }),
      })
    )
  )
);

export const useTodo = () => useTodoStore((state) => state.todos);
export const useFilter = () => useTodoStore((state) => state.filter);
export const addTodo = (text: string) => useTodoStore.getState().addTodo(text);
export const editTodo = (id: string, text: string) =>
  useTodoStore.getState().editTodo(id, text);
export const deleteTodo = (id: string) =>
  useTodoStore.getState().deleteTodo(id);
export const toggleTodo = (id: string) =>
  useTodoStore.getState().toggleTodo(id);
export const setIsEditing = (id: string, editingState: boolean) =>
  useTodoStore.getState().setIsEditing(id, editingState);
export const setFilter = (f: Filter) => useTodoStore.getState().setFilter(f);
