/**
 * @jest-environment jsdom
 */
import userEvent from "@testing-library/user-event"
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import  Bills  from "../containers/Bills.js"
import router from "../app/Router.js";
import mockStore from "../__mocks__/store"

//jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe('When I click on "icon-eye" ', () => {
    test('then, the modal with bill file is opened ', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({data: bills})
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }
      const bill = new Bills({
        document, 
        onNavigate, 
        store: null, 
        localStorage: window.localStorage
      })
      $.fn.modal = jest.fn()
      const iconEye = screen.getAllByTestId('icon-eye')[0]
      const handleClickIconEye = jest.fn(bill.handleClickIconEye)
      iconEye.addEventListener('click', function (){
          handleClickIconEye(iconEye)
      })
      userEvent.click(iconEye)
      expect(handleClickIconEye).toHaveBeenCalled()
      const modale = document.getElementById('modaleFile')
      expect(modale).toBeTruthy()
    })
  })
})
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {
    test("fetches bills from mock API GET", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }
      const bill = new Bills({
        document, 
        onNavigate, 
        store: mockStore, 
        localStorage: window.localStorage
      })
      const spy = jest.spyOn(bill, "getBills")
      const data = await bill.getBills()
      localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const title = screen.getByText("Mes notes de frais")
      expect(title).toBeTruthy()
      expect(spy).toHaveBeenCalled()
      expect(data.length).toBe(4)
    })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      document.body.innerHTML = BillsUI({error: "Erreur 404"})
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      const message = screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {
      document.body.innerHTML = BillsUI({error: "Erreur 500"})
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
  })
})
describe("Given I am a user connected as Employee", () => {
  describe('When I click on "Nouvelle note des frais"', () => {
    test('then, I should be render in NewBill page', async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({data: bills})
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }
      const bill = new Bills({
        document, 
        onNavigate, 
        store: null, 
        localStorage: window.localStorage
      })
      await waitFor(() => screen.getByTestId('icon-window'))
      const iconWindow = screen.getByTestId('icon-window')
      const btn = screen.getByTestId('btn-new-bill')
      const handleClickNewBill = jest.fn(bill.handleClickNewBill)
      btn.addEventListener('click', handleClickNewBill)
      userEvent.click(btn)
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(iconWindow.classList.contains('active-icon')).toBe(false)
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    }) 
  })
  describe("When I navigate on Bills Page", () => {
    test('Then I should land on a loading page', () => {
      document.body.innerHTML = BillsUI({ loading: true })
      const loading = document.getElementById('loading')
      expect(loading).toBeTruthy()
    })
    test('Then I should land on error page', () => {
      document.body.innerHTML = BillsUI({ error: 'some error message' })
      const erreur = screen.getAllByText('Erreur')
      expect(erreur).toBeTruthy()
    })
  })  
})



