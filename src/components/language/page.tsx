"use client"

import React, { useEffect } from "react"
import { useLanguagePage } from "@/hooks/useLanguagePage"
import { LanguageBoardView } from "./ui/LanguageBoardView"
import { WritingPracticeView } from "./ui/WritingPracticeView"
import { DialoguePracticeView } from "./ui/DialoguePracticeView"
import { BookOpen, PencilLine, Languages, MessageSquare } from "lucide-react"
import { HeaderPage } from "@/components/ui/HeaderPage"

export default function LanguageComponent() {
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
      <div className="flex gap-2 p-1 bg-secondary/35 border border-border/40 rounded-2xl w-fit max-w-full overflow-x-auto select-none backdrop-blur-sm shadow-sm">
        <button
          onClick={() => setActiveTab("vocab")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "vocab"
              ? "bg-primary text-primary-foreground shadow-glass shadow-glow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="h-4 w-4" /> Vocabulary Logs
        </button>
        <button
          onClick={() => setActiveTab("writing")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "writing"
              ? "bg-primary text-primary-foreground shadow-glass shadow-glow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <PencilLine className="h-4 w-4" /> Writing Practice
        </button>
        <button
          onClick={() => setActiveTab("dialogue")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "dialogue"
              ? "bg-primary text-primary-foreground shadow-glass shadow-glow"
              : "text-muted-foreground hover:text-foreground"
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
          freeWritingLogs={languageData.freeWritingLogs}
          filteredHistory={languageData.filteredHistory}
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
          searchQueryDialogue={languageData.searchQueryDialogue}
          setSearchQueryDialogue={languageData.setSearchQueryDialogue}
          selectedDialogueVocabId={languageData.selectedDialogueVocabId}
          setSelectedDialogueVocabId={languageData.setSelectedDialogueVocabId}
          searchDialogueVocabQuery={languageData.searchDialogueVocabQuery}
          setSearchDialogueVocabQuery={languageData.setSearchDialogueVocabQuery}
          showDialogueVocabDropdown={languageData.showDialogueVocabDropdown}
          setShowDialogueVocabDropdown={languageData.setShowDialogueVocabDropdown}
          dialogueEngQ={languageData.dialogueEngQ}
          setDialogueEngQ={languageData.setDialogueEngQ}
          dialogueTransQ={languageData.dialogueTransQ}
          setDialogueTransQ={languageData.setDialogueTransQ}
          dialogueEngA={languageData.dialogueEngA}
          setDialogueEngA={languageData.setDialogueEngA}
          dialogueTransA={languageData.dialogueTransA}
          setDialogueTransA={languageData.setDialogueTransA}
          dialogueFormError={languageData.dialogueFormError}
          revealedDialogueTranslationIds={languageData.revealedDialogueTranslationIds}
          handleSelectDialogueVocab={languageData.handleSelectDialogueVocab}
          handleAddDialogue={languageData.handleAddDialogue}
          handleDeleteDialogue={languageData.handleDeleteDialogue}
          toggleDialogueTranslation={languageData.toggleDialogueTranslation}
          revealAllDialogueTranslations={languageData.revealAllDialogueTranslations}
          hideAllDialogueTranslations={languageData.hideAllDialogueTranslations}
          filteredDialogueVocabList={languageData.filteredDialogueVocabList}
          filteredDialogues={languageData.filteredDialogues}
          dialogueCreatePending={languageData.dialogueCreatePending}
          dialogueDeletePending={languageData.dialogueDeletePending}
        />
      )}
    </div>
  )
}
