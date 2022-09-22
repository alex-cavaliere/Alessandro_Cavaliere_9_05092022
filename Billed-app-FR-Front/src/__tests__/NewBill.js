/**
* @jest-environment jsdom
*/
import "@testing-library/dom"
import { fireEvent } from "@testing-library/dom"
import { getByTestId } from "@testing-library/dom"
import { screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import router from "../app/Router"
import { ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("then, mail icon in vertical layout should be highlighted", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon.classList.contains('active-icon')).toBe(true)
    })
  })
  describe("When I click on 'Type de depense' ", () => {
    test('then, I have to chose an option', () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const expense = screen.getByTestId('expense-type')
    })
  })
})
