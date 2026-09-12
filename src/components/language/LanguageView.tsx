"use client"

import React, { useEffect } from "react"
import { useLanguagePage } from "@/hooks/useLanguagePage"
import { LanguageBoardView } from "./ui/LanguageBoardView"
import { WritingPracticeView } from "./ui/WritingPracticeView"
import { DialoguePracticeView } from "./ui/DialoguePracticeView"
import { FormulaListView } from "./ui/FormulaListView"
import { BookOpen, PencilLine, Languages, MessageSquare, Braces } from "lucide-react"
import { HeaderPage } from "@/components/ui/HeaderPage"

export function LanguageView(): React.JSX.Element {
  const languageData = useLanguagePage()
  const { activeTab, setActiveTab, vocabList, writingList } = languageData

  // Update document title for client-side SEO
  useEffect(() => {
    document.title = "Language Logs - SansOS Workspace"
  }, [])

  return (
    <div className="mx-auto max-w-7xl gap-6 flex flex-col py-4 animate-in fade-in duration-200">
      <HeaderPage
        title="Language Logs"
        icon={<Languages className="h-7 w-7 text-primary shrink-0" />}
        description="Track foreign vocabulary definitions, study quiz lists, and practice writing sentences"
      />

      {/* Sub-Navigation Tabs */}
      <div className="flex gap-1.5 p-1.5 bg-secondary/35 border border-border/40 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar select-none backdrop-blur-md shadow-sm shrink-0">
        <button
          onClick={() => setActiveTab("vocab")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "vocab"
              ? "bg-primary text-primary-foreground shadow-glass shadow-glow font-extrabold"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
          }`}
        >
          <BookOpen className="h-4 w-4" /> Vocabulary Logs
        </button>
        <button
          onClick={() => setActiveTab("formula")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "formula"
              ? "bg-primary text-primary-foreground shadow-glass shadow-glow font-extrabold"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
          }`}
        >
          <Braces className="h-4 w-4" /> Formula List
        </button>
        <button
          onClick={() => setActiveTab("writing")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "writing"
              ? "bg-primary text-primary-foreground shadow-glass shadow-glow font-extrabold"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
          }`}
        >
          <PencilLine className="h-4 w-4" /> Writing Practice
        </button>
        <button
          onClick={() => setActiveTab("dialogue")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "dialogue"
              ? "bg-primary text-primary-foreground shadow-glass shadow-glow font-extrabold"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
          }`}
        >
          <MessageSquare className="h-4 w-4" /> Dialogue Practice
        </button>
      </div>

      {activeTab === "vocab" ? (
        <LanguageBoardView
          vocabList={vocabList}
          isLoading={languageData.vocabIsLoading}
          isError={languageData.vocabIsError}
          showAddForm={languageData.showAddForm}
          setShowAddForm={languageData.setShowAddForm}
          searchQuery={languageData.searchQuery}
          setSearchQuery={languageData.setSearchQuery}
          memorizedFilter={languageData.memorizedFilter}
          setMemorizedFilter={languageData.setMemorizedFilter}
          revealedTranslationIds={languageData.revealedTranslationIds}
          word={languageData.word}
          setWord={languageData.setWord}
          translation={languageData.translation}
          setTranslation={languageData.setTranslation}
          langDirection={languageData.langDirection}
          setLangDirection={languageData.setLangDirection}
          formError={languageData.formError}
          handleAddVocabulary={languageData.handleAddVocabulary}
          handleDeleteVocabulary={languageData.handleDeleteVocabulary}
          handleToggleMemorized={languageData.handleToggleMemorized}
          toggleRevealTranslation={languageData.toggleRevealTranslation}
          revealAllTranslations={languageData.revealAllTranslations}
          hideAllTranslations={languageData.hideAllTranslations}
          totalWords={languageData.totalWords}
          memorizedCount={languageData.memorizedCount}
          memorizedPercentage={languageData.memorizedPercentage}
          filteredVocab={languageData.filteredVocab}
          vocabCreatePending={languageData.vocabCreatePending}
          writingCount={writingList.length}
        />
      ) : activeTab === "formula" ? (
        <FormulaListView
          formulaList={languageData.formulaList}
          writingList={writingList}
          dialogueList={languageData.dialogueList}
          isLoading={languageData.formulaIsLoading}
          isError={languageData.formulaIsError}
          showFormulaForm={languageData.showFormulaForm}
          setShowFormulaForm={languageData.setShowFormulaForm}
          formulaName={languageData.formulaName}
          setFormulaName={languageData.setFormulaName}
          formulaString={languageData.formulaString}
          setFormulaString={languageData.setFormulaString}
          formulaDescription={languageData.formulaDescription}
          setFormulaDescription={languageData.setFormulaDescription}
          searchQueryFormula={languageData.searchQueryFormula}
          setSearchQueryFormula={languageData.setSearchQueryFormula}
          formulaFormError={languageData.formulaFormError}
          handleAddFormula={languageData.handleAddFormula}
          handleUpdateFormula={languageData.handleUpdateFormula}
          handleDeleteFormula={languageData.handleDeleteFormula}
          filteredFormulas={languageData.filteredFormulas}
          formulaCreatePending={languageData.formulaCreatePending}
        />
      ) : activeTab === "writing" ? (
        <WritingPracticeView
          showWritingForm={languageData.showWritingForm}
          setShowWritingForm={languageData.setShowWritingForm}
          vocabList={vocabList}
          writingList={writingList}
          isLoading={languageData.writingIsLoading}
          isError={languageData.writingIsError}
          practiceMode={languageData.practiceMode}
          setPracticeMode={languageData.setPracticeMode}
          activeHistoryTab={languageData.activeHistoryTab}
          setActiveHistoryTab={languageData.setActiveHistoryTab}
          searchQueryWriting={languageData.searchQueryWriting}
          setSearchQueryWriting={languageData.setSearchQueryWriting}
          selectedVocabId={languageData.selectedVocabId}
          setSelectedVocabId={languageData.setSelectedVocabId}
          searchVocabQuery={languageData.searchVocabQuery}
          setSearchVocabQuery={languageData.setSearchVocabQuery}
          showVocabDropdown={languageData.showVocabDropdown}
          setShowVocabDropdown={languageData.setShowVocabDropdown}
          selectedWritingFormulaId={languageData.selectedWritingFormulaId}
          setSelectedWritingFormulaId={languageData.setSelectedWritingFormulaId}
          searchWritingFormulaQuery={languageData.searchWritingFormulaQuery}
          setSearchWritingFormulaQuery={languageData.setSearchWritingFormulaQuery}
          showWritingFormulaDropdown={languageData.showWritingFormulaDropdown}
          setShowWritingFormulaDropdown={languageData.setShowWritingFormulaDropdown}
          filteredWritingFormulaList={languageData.filteredWritingFormulaList}
          freeEnglish={languageData.freeEnglish}
          setFreeEnglish={languageData.setFreeEnglish}
          freeTranslation={languageData.freeTranslation}
          setFreeTranslation={languageData.setFreeTranslation}
          vocabEngPos={languageData.vocabEngPos}
          setVocabEngPos={languageData.setVocabEngPos}
          vocabTransPos={languageData.vocabTransPos}
          setVocabTransPos={languageData.setVocabTransPos}
          vocabEngNeg={languageData.vocabEngNeg}
          setVocabEngNeg={languageData.setVocabEngNeg}
          vocabTransNeg={languageData.vocabTransNeg}
          setVocabTransNeg={languageData.setVocabTransNeg}
          vocabEngInt={languageData.vocabEngInt}
          setVocabEngInt={languageData.setVocabEngInt}
          vocabTransInt={languageData.vocabTransInt}
          setVocabTransInt={languageData.setVocabTransInt}
          writingFormError={languageData.writingFormError}
          handleAddWriting={languageData.handleAddWriting}
          handleDeleteWriting={languageData.handleDeleteWriting}
          handleSelectVocab={languageData.handleSelectVocab}
          filteredVocabList={languageData.filteredVocabList}
          vocabWritingLogs={languageData.vocabWritingLogs}
          formulaWritingLogs={languageData.formulaWritingLogs}
          freeWritingLogs={languageData.freeWritingLogs}
          filteredGroupedHistory={languageData.filteredGroupedHistory}
          filteredFormulaHistory={languageData.filteredFormulaHistory}
          filteredFreeHistory={languageData.filteredFreeHistory}
          writingCreatePending={languageData.writingCreatePending}
          writingDeletePending={languageData.writingDeletePending}
        />
      ) : (
        <DialoguePracticeView
          vocabList={vocabList}
          dialogueList={languageData.dialogueList}
          isLoading={languageData.dialogueIsLoading}
          isError={languageData.dialogueIsError}
          showDialogueForm={languageData.showDialogueForm}
          setShowDialogueForm={languageData.setShowDialogueForm}
          dialoguePracticeMode={languageData.dialoguePracticeMode}
          setDialoguePracticeMode={languageData.setDialoguePracticeMode}
          dialogueActiveHistoryTab={languageData.dialogueActiveHistoryTab}
          setDialogueActiveHistoryTab={languageData.setDialogueActiveHistoryTab}
          searchQueryDialogue={languageData.searchQueryDialogue}
          setSearchQueryDialogue={languageData.setSearchQueryDialogue}
          selectedDialogueVocabId={languageData.selectedDialogueVocabId}
          setSelectedDialogueVocabId={languageData.setSelectedDialogueVocabId}
          searchDialogueVocabQuery={languageData.searchDialogueVocabQuery}
          setSearchDialogueVocabQuery={languageData.setSearchDialogueVocabQuery}
          showDialogueVocabDropdown={languageData.showDialogueVocabDropdown}
          setShowDialogueVocabDropdown={languageData.setShowDialogueVocabDropdown}
          selectedDialogueFormulaId={languageData.selectedDialogueFormulaId}
          setSelectedDialogueFormulaId={languageData.setSelectedDialogueFormulaId}
          searchDialogueFormulaQuery={languageData.searchDialogueFormulaQuery}
          setSearchDialogueFormulaQuery={languageData.setSearchDialogueFormulaQuery}
          showDialogueFormulaDropdown={languageData.showDialogueFormulaDropdown}
          setShowDialogueFormulaDropdown={languageData.setShowDialogueFormulaDropdown}
          filteredDialogueFormulaList={languageData.filteredDialogueFormulaList}
          dialogueEngQ={languageData.dialogueEngQ}
          setDialogueEngQ={languageData.setDialogueEngQ}
          dialogueTransQ={languageData.dialogueTransQ}
          setDialogueTransQ={languageData.setDialogueTransQ}
          dialogueEngA={languageData.dialogueEngA}
          setDialogueEngA={languageData.setDialogueEngA}
          dialogueTransA={languageData.dialogueTransA}
          setDialogueTransA={languageData.setDialogueTransA}
          dialogueFormula={languageData.dialogueFormula}
          setDialogueFormula={languageData.setDialogueFormula}
          dialogueFormError={languageData.dialogueFormError}
          revealedDialogueTranslationIds={languageData.revealedDialogueTranslationIds}
          handleSelectDialogueVocab={languageData.handleSelectDialogueVocab}
          handleAddDialogue={languageData.handleAddDialogue}
          handleDeleteDialogue={languageData.handleDeleteDialogue}
          toggleDialogueTranslation={languageData.toggleDialogueTranslation}
          revealAllDialogueTranslations={languageData.revealAllDialogueTranslations}
          hideAllDialogueTranslations={languageData.hideAllDialogueTranslations}
          filteredDialogueVocabList={languageData.filteredDialogueVocabList}
          vocabDialogueLogs={languageData.vocabDialogueLogs}
          formulaDialogueLogs={languageData.formulaDialogueLogs}
          filteredVocabDialogueHistory={languageData.filteredVocabDialogueHistory}
          filteredFormulaDialogueHistory={languageData.filteredFormulaDialogueHistory}
          dialogueCreatePending={languageData.dialogueCreatePending}
          dialogueDeletePending={languageData.dialogueDeletePending}
        />
      )}
    </div>
  )
}

export default LanguageView
