import { ProjectScanner } from "../core/scanner"
import * as fs from "fs"
import { jest } from "@jest/globals"

// Mock filesystem for testing
jest.mock("fs")
jest.mock("fast-glob")

const mockFs = fs as jest.Mocked<typeof fs>
const mockGlob = require("fast-glob") as jest.MockedFunction<any>

describe("ProjectScanner", () => {
  let scanner: ProjectScanner
  const mockRootDir = "/mock/project"

  beforeEach(() => {
    scanner = new ProjectScanner(mockRootDir)
    jest.clearAllMocks()
  })

  describe("scanForAliases", () => {
    it("should generate aliases for project structure", async () => {
      // Mock filesystem structure
      mockFs.existsSync.mockReturnValue(true)
      mockGlob.mockResolvedValue([
        "/mock/project/src/components",
        "/mock/project/src/utils",
        "/mock/project/src/hooks",
        "/mock/project/src/components/ui",
      ])

      const aliases = await scanner.scanForAliases()

      expect(aliases).toHaveLength(5) // Including root src alias
      expect(aliases[0]).toEqual({
        alias: "@/*",
        path: "./src/*",
        relativePath: "",
      })
      
      expect(aliases[1].alias).toBe("@components")
      expect(aliases[2].alias).toBe("@utils")
      expect(aliases[3].alias).toBe("@hooks")
      expect(aliases[4].alias).toBe("@components/ui")
    })

    it("should throw error if src directory does not exist", async () => {
      mockFs.existsSync.mockReturnValue(false)

      await expect(scanner.scanForAliases()).rejects.toThrow("Source directory not found")
    })

    it("should handle empty project structure", async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockGlob.mockResolvedValue([])

      const aliases = await scanner.scanForAliases()

      expect(aliases).toHaveLength(1) // Only root src alias
      expect(aliases[0].alias).toBe("@/*")
    })
  })
})
