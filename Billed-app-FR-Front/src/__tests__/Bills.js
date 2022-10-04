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
import { mockedBills } from "../__mocks__/store.js"
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
})
