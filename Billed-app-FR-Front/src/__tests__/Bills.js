/**
 * @jest-environment jsdom
 */
import { getByTestId } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import  Bills  from "../containers/Bills.js"
import router from "../app/Router.js";
import path from "path"

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
    test('then, I should see the modal', () => {
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
      const handleClickIconEye = jest.fn(bill.handleClickIconEye)
      const iconEye = screen.getAllByTestId('icon-eye')
      iconEye[0].addEventListener('click', function (){
          handleClickIconEye(iconEye)
        })
      userEvent.click(iconEye[0])
      expect(handleClickIconEye).toHaveBeenCalled()  
      const modale = document.getElementById('modaleFile')
      expect(modale).toBeTruthy()
    })
  })
})
