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
  })
  describe("When I am on NewBill Page", () => {
    test("then, mail icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      //to-do write assertion
      window.onNavigate(ROUTES_PATH['NewBill'])
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon.classList.contains('active-icon')).toBe(true)
    })
  })
  describe('When I submit the form', () => {
    test('Then, "handleSubmit" have to be called', () => {
        // Init newBill
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

        fireEvent.submit(formNewBill)
        // handleChangeFile function must be called
        expect(handleSubmit).toHaveBeenCalled()
    })
    test('Then, should add a new bill', async () => {
      document.body.innerHTML = NewBillUI()
      // Init newBill
      const newBill = new NewBill({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage
      })

      const handleSubmit = jest.fn(() => newBill.handleSubmit)
      const formNewBill = screen.getByTestId('form-new-bill')
      //const inputFile = screen.getByTestId('file')
      formNewBill.addEventListener('submit', handleSubmit)
      newBill.fileName = 'image.png'
      window.onNavigate(ROUTES_PATH['Bills'])
      await waitFor(() => screen.getByTestId('icon-window'))
      const iconWindow = screen.getByTestId('icon-window')
      fireEvent.submit(formNewBill)
      // handleChangeFile function must be called
      expect(handleSubmit).toHaveBeenCalled()
      expect(iconWindow).toHaveClass('active-icon')
    })
    test('Then, should stay in NewBill page', async () => {
      document.body.innerHTML = NewBillUI()
      // Init newBill
      const newBill = new NewBill({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage
      })

      const handleSubmit = jest.fn(() => newBill.handleSubmit)
      const formNewBill = screen.getByTestId('form-new-bill')
      //const inputFile = screen.getByTestId('file')
      formNewBill.addEventListener('submit', handleSubmit)
      newBill.fileName = null
      window.onNavigate(ROUTES_PATH['NewBill'])
      await waitFor(() => screen.getByTestId('icon-mail'))
      const iconMail = screen.getByTestId('icon-mail')
      fireEvent.submit(formNewBill)
      // handleChangeFile function must be called
      expect(handleSubmit).toHaveBeenCalled()
      expect(iconMail).toHaveClass('active-icon')
    })
  })
  describe('When I choose an image to upload', () => {
    test('then, file image change', () => {
      document.body.innerHTML = NewBillUI()
      const mockStore = {
        bills: jest.fn(() => newBill.store),
        create: jest.fn(() => Promise.resolve({}))
      }
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })
      window.alert = jest.fn()
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      let imageFile = screen.getByTestId('file')
      imageFile.addEventListener('change', handleChangeFile)
      fireEvent.change(imageFile, {
        target: {
          files: [new File(['image.png'], 'image.png', {
            type: 'image/png'
          })]
        }
      })
      expect(handleChangeFile).toHaveBeenCalled()
    })
  })
})
