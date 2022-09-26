/**
* @jest-environment jsdom
*/
import "@testing-library/jest-dom"
import { fireEvent } from "@testing-library/dom"
import { getByTestId } from "@testing-library/dom"
import { screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import router from "../app/Router"
import { ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event"
import { mockedBills } from "../__mocks__/store.js"
import Bills from "../containers/Bills.js"
import Store from "../app/Store.js"

const onNavigate = (pathname) => {
  document.body.innerHTML = pathname
}

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
  })
  describe("When I am on NewBill Page", () => {
    test("then, mail icon in vertical layout should be highlighted", async () => {
      //to-do write assertion
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon.classList.contains('active-icon')).toBe(true)
    })
  })
  describe('When I submit the form', () => {
    test('Then, "handleSUbmit" have to be called', () => {
        // build user interface
        //jest.mock('../containers/NewBill')
        // Init newBill
        const mockStore = {
          bills: jest.fn(() => newBill.store),
          create: jest.fn(() => Promise.resolve({}))
        }
        const newBill = new NewBill({
            document,
            onNavigate,
            store: null,
            localStorage: window.localStorage
        })

        const handleSubmit = jest.fn(() => newBill.handleSubmit)

        //const btn = document.getElementById('btn-send-bill')
        const formNewBill = screen.getByTestId('form-new-bill')
        //const inputFile = screen.getByTestId('file')
        formNewBill.addEventListener('submit', handleSubmit)
        //inputFile.addEventListener('change', handleSubmit)
        //userEvent.click(btn)

        fireEvent.submit(formNewBill)
        // handleChangeFile function must be called
        expect(handleSubmit).toHaveBeenCalled()
    })
  })
  describe('When I choose an image to upload', () => {
    test('then, file image change', () => {
      document.body.innerHTML = NewBillUI()
      const mockedBills = {
        bills: jest.fn(() => newBill.store),
        create: jest.fn(() => Promise.resolve({}))
      }
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockedBills,
        localStorage: window.localStorage
      })

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      let imageFile = screen.getByTestId('file')
      imageFile.addEventListener('change', handleChangeFile)
      fireEvent.change(imageFile, {
        target: {
          files: [new File(['image.png'], 'image.png', {
            type: 'png'
          })]
        }
      })
      expect(handleChangeFile).toHaveBeenCalled()
    })
  })
})
