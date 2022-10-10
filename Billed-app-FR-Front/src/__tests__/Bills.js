/**
 * @jest-environment jsdom
 */
import { fireEvent, getByTestId } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import  Bills  from "../containers/Bills.js"
import router from "../app/Router.js";
import mockStore from "../__mocks__/store"
import path from "path"
import { get } from "jquery"

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
  describe('When I click on "Nouvelle note des frais"', () => {
    test('then, I should be render in NewBill page', async () => {
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
    }) 
  })

  // aggiustare test


  describe("When I navigate on Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getAllByTestId('icon-window')[0])
      await waitFor(() => screen.getAllByTestId('icon-mail')[0])
      const iconWindow = screen.getAllByTestId('icon-window')[0]
      const iconMail = screen.getAllByTestId('icon-mail')[0]
      expect(bills.length).toBe(4)
      expect(iconWindow.classList.contains('active-icon')).toBe(true)
      expect(iconMail.classList.contains('active-icon')).toBe(false)
    })
  test("When an error occurs on API", async () => {
    /*beforeEach(() => {
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
    })*/
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
    window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.appendChild(root)
    router()
    window.onNavigate(ROUTES_PATH.Bills)
    const pageData = jest.spyOn(mockStore, "bills")
    await waitFor(() => mockStore.bills())
    expect(pageData).toHaveBeenCalled()
    //aggiustare test
  })
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      document.body.innerHTML = BillsUI({error: "Erreur 404"})
      const message = screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      document.body.innerHTML = BillsUI({error: "Erreur 500"})
      const message = screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
  })

